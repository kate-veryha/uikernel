---
title: Removing records
id: removing-records
prev: editing-grid-data.html
next: creating-records.html
---

Let's make our records removable.

[Live demo](/examples/removing-records/){:target="_blank"} and [code example]({{site.github}}_site/examples/removing-records){:target="_blank"} are available here.

Add delete function to our Grid model. 

{% highlight javascript tabsize=2 %}
var model = new UIKernel.Models.Grid.Collection({
  // ...
});

model.delete = function (id) {
  this.data = _.reject(this.data, function (record) {
    return record[0] === id;
  });
  return id;
};
{% endhighlight %}

To do that, we'll start with a remove button. Here, we'll create it as the first column.
`columns.js`:
{% highlight javascript tabsize=2 %}
var columns = {
  tools: {
    width: 50,
    render: [function () {
      return '<a href="javascript:void(0)" ref="del">[X]</a>';
    }],
    onClickRefs: {
      del: function (event, recordId, record, grid) { // ref="del" click handler
        grid.getModel().delete(recordId); // our delete function
        grid.updateTable(); // update table after delete a record
      }
    }
  },
  // ...
};
{% endhighlight %}