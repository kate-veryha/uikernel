---
title: Tutorial
id: tutorial
prev: getting-started.html
next: first-grid-component.html
---
* [Live demo](/examples/creating-records/){:target="_blank"}
* [Code]({{site.github}}_site/examples/creating-records){:target="_blank"}

This tutorial demonstrates how to build forms and editable grids with UIKernel. The steps for this tutorial are as follows:

1. Create a grid
2. Add sorting and pagination to our grid
3. Create a from for filtering grid data
4. Make our grid editable
5. Add the possibility to remove records from our grid
6. Create a from for adding records to our grid


To get started, we will need to install the [UIKernel package](https://www.npmjs.com/package/uikernel){:target="_blank"}.
In the command line, run the following command:

{% highlight html %}
npm install uikernel
{% endhighlight %}

This will create a `node_modules` folder in which will be UIKernel.

Then [download](/download.html) CSS & Images.

Next, create a directory with the following structure:

{% highlight html %}
|-- css
    |-- uikernel
        * css and images we've downloaded
    bootstrap.min.css
    main.css
|-- js
    |-- components
        FiltersForm.jsx
        CreateForm.jsx
        MainComponent.jsx
    |-- libs
        uikernel.js
    |-- model
        model.js
        validation.js
    columns.jsx
    main.jsx
index.html
{% endhighlight %}
---

Our `index.html` file should look like this:

{% highlight html %}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>Example</title>
    <link href="css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
    <link href="css/uikernel/main.css" rel="stylesheet" type="text/css"/>
    <link href="css/main.css" rel="stylesheet" type="text/css"/>
</head>
<body>


<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/react.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/0.13.3/JSXTransformer.js"></script>
<script src="js/libs/uikernel.js"></script>

<!-- Validation -->
<script src="js/model/validation.js"></script>

<!-- Our first model -->
<script src="js/model/model.js"></script>

<!-- Our main component -->
<script src="js/components/MainComponent.jsx" type="text/jsx"></script>

<!-- Its columns -->
<script src="js/columns.jsx" type="text/jsx"></script>

<!-- Form for filtering records -->
<script src="js/components/FiltersForm.jsx" type="text/jsx"></script>

<!-- Form for creating new records -->
<script src="js/components/CreateForm.jsx" type="text/jsx"></script>

<!-- Main file to render -->
<script src="js/main.jsx" type="text/jsx"></script>
</body>
</html>
{% endhighlight %}
---

Now you can move on to the first step of our tutorial.
