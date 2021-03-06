/**
 * Copyright (с) 2015, SoftIndex LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule UIKernel
 */

'use strict';

var utils = require('../../common/utils');
var React = require('react');

var GridUIMixin = {
  /**
   * Table content click event handler
   *
   * @param {Event} event
   */
  handleBodyClick: function (event) {
    var $target = $(event.target);
    var $refParent = $target.parents('[ref]');
    var element;

    if ($target.hasClass('dgrid-cell')) {
      element = event.target;
    } else {
      element = $target.parents('td.dgrid-cell').get(0);
    }

    if (element) {
      this.handleCellClick(event, element, $refParent.attr('ref') || event.target.getAttribute('ref'));
    }
  },

  /**
   * Cell click handler
   *
   * @param {Event}           event       Event object
   * @param {HTMLElement}     element     Cell DOM element
   * @param {string}          ref         Click handler name in the table configuration
   */
  handleCellClick: function (event, element, ref) {
    var colId = $(element).attr('key');
    var row = $(element).parent().attr('key');
    var columnConfig = this.props.cols[colId];
    var recordId = this.state.recordsInfo[row].id;
    var record = this._getRecord(row);

    // Trigger click handler on the table configuration
    if (ref) {
      columnConfig.onClickRefs[ref](event, recordId, record, this);
    } else if (columnConfig.onClick) {
      columnConfig.onClick(event, recordId, record, this);
    }

    // Open cell editor
    if (this.props.cols[colId].editor) {
      this._renderEditor(element, row, colId);
    }
  },

  /**
   * Fetch server data
   */
  updateTable: function (cb) {
    this._showLoader(true);

    if (!this.props.model) {
      return;
    }

    this._loadData({
      limit: this.state.viewCount,
      offset: this.state.page * this.state.viewCount,
      sort: this._sortingToArray(),
      fields: this._getFieldsToRender(),
      extra: this._getAdditionalIds()
    }, function (err, obj) {
      var data;
      var extra;
      var page;

      if (!this.isMounted()) {
        return;
      }

      if (err) {
        if (cb) {
          return cb(err);
        }
        throw err;
      }

      // If required page is not included in the range of existing pages,
      // request existing in a moment page
      page = this._checkPage(this.state.page, this.state.viewCount, obj.count);
      if (page !== this.state.page) {
        this.state.page = page;
        this.updateTable(cb);
        return;
      }

      data = this._dataArrayToObject(obj.records);
      extra = obj.extraRecords ? this._dataArrayToObject(obj.extraRecords) : [];

      this.setState({
        data: utils.assign({}, data.records, extra.records),
        mainIds: Object.keys(data.records),
        count: obj.count,
        totals: obj.totals,
        recordsInfo: utils.assign({}, extra.info, data.info)
      }, function () {
        this._renderBody();
        this._showLoader(false);
        if (cb) {
          cb();
        }
      });
    }.bind(this));
  },

  /**
   * Show/hide loading icon
   *
   * @param {boolean} show True - Show, False - Hide
   * @private
   */
  _showLoader: function (show) {
    if (show) {
      $(this.refs.loader.getDOMNode()).addClass('dgrid-loader');
    } else {
      $(this.refs.loader.getDOMNode()).removeClass('dgrid-loader');
    }
  },

  /**
   * Get table cell HTML
   *
   * @param   {number}    column    Column ID
   * @param   {Object}    record    Table record
   * @param   {bool}      selected  "Selected" row status
   * @returns {string}    Table cell HTML
   * @private
   */
  _getCellHTML: function (column, record, selected) {
    var cellHtml = this.props.cols[column].render[this.props.cols[column].render.length - 1](record, selected);
    if (cellHtml === undefined) {
      return '';
    }
    return cellHtml;
  },

  /**
   * Get table row HTML
   *
   * @param       {number}    row         Row ID
   * @param       {string}    className   <TR> class attribute
   * @returns     {string}    Table row HTML
   * @private
   */
  _getRowHTML: function (row, className) {
    var colId;
    var record = this._getRecord(row);
    var selected = this.isSelected(this.state.recordsInfo[row].id);
    var html = '<tr key="' + row + '" class="' +
      (className || '') +
      ' ' + this._getRowStatusNames(row).join(' ') +
      '">';
    for (colId in this.props.cols) {
      if (this._isViewColumn(colId)) {
        html += '<td key="' + colId + '" class="dgrid-cell' +
        (this._getColumnClass(colId) ? ' ' + this._getColumnClass(colId) : '') +
        (this._isChanged(row, this._getBindParam(colId)) ? ' dgrid-changed' : '') +
        (this._hasError(row, this._getBindParam(colId)) ? ' dgrid-error' : '') +
        '">' +
        this._getCellHTML(colId, record, selected) +
        '</td>';
      }
    }
    return html + '</tr>';
  },

  /**
   * Redraw table content totally
   *
   * @private
   */
  _renderBody: function () {
    if (!this.state.data) {
      return;
    }

    var i;
    var row;
    var htmlExtra = '';
    var htmlBody = '';
    var sorted = utils.pairs(this.state.recordsInfo).sort(function (a, b) {
      return a[1].index - b[1].index;
    });

    for (i = 0; i < sorted.length; i++) {
      row = sorted[i][0];
      if (this._isMainRow(row)) {
        htmlBody += this._getRowHTML(row);
      } else if (this._isChanged(row) || this._getRowStatusNames(row).length) {
        htmlExtra += this._getRowHTML(row, 'others');
      }
    }

    this.refs.tbody.getDOMNode().innerHTML = htmlExtra + htmlBody;
  },

  /**
   * Display model changes
   *
   * @param {string} row      Row ID
   * @param {string} param    Model parameter
   * @private
   */
  _renderBinds: function (row, param) {
    // If parameter does not affect on the redraw, do nothing
    if (!this._isFieldAffectsRender(param)) {
      return;
    }

    this._getDependentColumns(param).forEach(function (column) {
      if (this._isViewColumn(column) && !this._isEditorVisible(row, column)) {
        this._updateField(row, column);
      }
    }, this);
  },

  /**
   * Get cell DOM element
   *
   * @param {number}  recordId   Record ID
   * @param {number}  colId      Column ID
   * @returns {HTMLElement} Cell DOM element
   * @private
   */
  _getCellElement: function (recordId, colId) {
    return this.refs.body.getDOMNode()
      .find('tr[key=' + recordId + ']')
      .find('td[key=' + colId + ']');
  },

  _removeTR: function (recordId) {
    $(this.refs.body.getDOMNode())
      .find('tr[key=' + recordId + ']')
      .remove();
  },

  _renderTotals: function () {
    var header = this._formHeader();
    var totalsDisplayed = false;
    var i;
    var className;
    var totalsRowHTML = '';

    // If data for result line display exists, form it
    if (this.state.totals) {
      for (i in this.props.cols) {
        if (!this._isViewColumn(i)) {
          continue;
        }

        className = this.props.cols[i].className;
        if (className) {
          totalsRowHTML += '<td class="' + className + '">';
        } else {
          totalsRowHTML += '<td>';
        }

        if (this.state.totals.hasOwnProperty(i)) {
          totalsRowHTML += this._getCellHTML(i, this.state.totals, false);
          totalsDisplayed = true;
        }

        totalsRowHTML += '</td>';
      }
    }

    return totalsDisplayed ? (
      <table cellSpacing="0" className="dgrid-totals">
        <colgroup>{header.colGroup}</colgroup>
        <tr dangerouslySetInnerHTML={{__html: totalsRowHTML}}></tr>
      </table>
    ) : null;
  },

  _updateField: function (row, column) {
    $(this.refs.body.getDOMNode())
      .find('tr[key=' + row + ']')
      .find('td[key=' + column + ']')
      .html(this._getCellHTML(column, this._getRecord(row)))
      .removeClass('dgrid-changed dgrid-error')
      .addClass(this._isChanged(
        row,
        this._getBindParam(column)) ? 'dgrid-changed' : '')
      .addClass(this._hasError(
        row,
        this._getBindParam(column)) ? 'dgrid-error' : '');
  },

  _updateRow: function (row, cb) {
    if (this.state.data[row]) {
      this._renderBody();
      if (cb) {
        cb();
      }
    } else {
      this.updateTable(cb);
    }
  }
};

module.exports = GridUIMixin;
