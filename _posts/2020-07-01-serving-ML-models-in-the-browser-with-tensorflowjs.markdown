---
layout: post
title:  "Serving Machine Learning Models in the Browser with TensorflowJS"
date:   2020-06-22 08:00:00 -0500
categories: tensorflowjs keras
---
You've cleaned your data, tuned the parameters, and trained a highly accurate model. Most machine learning tutorials stop at this point, but what if you would like to implement your model for use outside of a Jupyter notebook? One of the biggest challenges in machine learning is serving your model. You could save your trained model, and then serve it with Flask, or another web serving app, but this can be slow and expensive due to its use of server resources. A quicker way is to serve the model as a static file directly to a client's browser. Additionally, costs can be saved by serving this model in a Amazon S3 bucket. We will use an MNIST digit recognition model in a Jupyter notebook as an example.

# Creating a Model
This assumes you have already created and trained a model in Python script or Jupyter Notebook. First, install the tensorflowjs Python library.
```console
pip install tensorflowjs
```

# Adding Model to Amazon S3
# Calling a Model with Javascript
