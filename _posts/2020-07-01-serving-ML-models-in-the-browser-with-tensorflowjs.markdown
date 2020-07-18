---
layout: post
title:  "Serving Machine Learning Models in the Browser with TensorflowJS"
date:   2020-06-22 08:00:00 -0500
categories: tensorflowjs keras
---
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js"></script>
You've cleaned your data, tuned the parameters, and trained a highly accurate model. Most machine learning tutorials stop at this point, but what if you would like to implement your model for use outside of a Jupyter notebook? One of the biggest challenges in machine learning is serving your model. You could save your trained model, and then serve it as a web app with something like Flask, but this can be slow and expensive due to its use of server resources. A more cost effective way is to serve the model as a static file directly to a client's browser with a service like Amazon S3. We will use an MNIST digit recognition model created from Keras, serve it in S3, and show how it can be served in a browser with TensorflowJS.  

### Draw a Number on the Canvas Below and Click Predict  
<canvas width="224" height="224" style="background-color: black;" id="mnistCanvas"></canvas>
<button id="clearBtn">Clear</button>
<button id="submitBtn">Predict</button>
<p id="canvasDigitResult"></p>

The canvas above is using a static model served with TensorflowJS to predict which digit is being drawn. The steps below will demonstrate how the machine learning model it uses is being served.
This tutorial will not go into the steps of how this model was trained with Keras, but a Jupyter Notebook on how it was created can be found [here](https://github.com/danielhallinan88/mnist_tensorflowjs_export).

# Creating a Model
This assumes you have already created and trained a model in a Python script or Jupyter Notebook. First, install the tensorflowjs Python library.
```bash
pip install tensorflowjs
```
This library provides two methods for turning your Tensorflow or Keras models into static files that can be used later. The tensorflowjs library can be used within your Python code, such as a Jupyter notebook, or you can use the tensorflowjs command tool to turn a saved model into a JSON file that can be called with Javascript.

#### Option 1: Python code
Once the model has been fitted to the training data, you can then convert the Keras model to a model.json file that can later be read in Javascript. Just provide the model, and name of the directory you would like to create for model.json and other necessary files to the "save_keras_model" function.
```python
import tensorflowjs as tfjs

tfjs.converters.save_keras_model(model, 'mnist-model')
```

#### Option 2: Command Line
If you have already saved a fitted model you can use the tensorflowjs_converter command line tool to convert that model. Just provide the type of model, which in this case is 'keras', and the name of the model file, and the output directory.
```bash
tensorflowjs_converter --input_format=keras /tmp/model.h5 /tmp/mnist-model
```
After you have converted your model you will have two files in the output directory you provided: "model.json" and "group1-shard1of1.bin". You will need to serve both of these files in order to be used by your Javascript.

# Adding a Model to Amazon S3
An easy way to serve your model files is with Amazon S3. [Login to AWS here](https://console.aws.amazon.com/console/home?nc2=h_ct&src=header-signin) . If you do not have an account click "Create a new AWS account".
Once you have logged in, navigate to "Services" and click on "S3".

![AWS_S3]({{ site.url }}/assets/images/aws_s3.png)

Once you are in the S3 console click on "Create Bucket". You will need create a bucket name that is unique, and choose a region it will be hosted in. Click "Next" on the "Configure options" page. On the "Set permissions" page uncheck "Block all public access" to make this model publicly available, and click "Next". Finally, click "Finish".
![Create_bucket]({{ site.url }}/assets/images/aws_s3_create_bucket_name_region.PNG)

The newly created bucket should now be listed in the S3 console. Click on it to view the overview, and then click "Upload" to add the model directory that was created earlier. Click "Next" through the following questions, and finally "Upload". You should now be able to see the folder "mnist-model", and inside the files "model.json" and "group1-shard1of1.bin". Clicking on "model.json" will provide an overview, and reveal the URL you will need under "Object URL".  

![Bucket_modeljson]({{ site.url }}/assets/images/aws_s3_modeljson.PNG)

When clicking on the model.json URL you will get an "Access Denied" error. This is because it needs to have its permissions made public, and allowed in the CORS policy.
In the "Overview" section click "Make Public".

Go back to your bucket, and click on "Permissions". Then click the button that says "CORS Configuration". Use the basic configuration below, and click "Save".
```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <ExposeHeader>Access-Control-Allow-Origin</ExposeHeader>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```
Refresh the model.json URL and the JSON should now be visible. 

# Calling a Model with Javascript
Now that our model is being served we are able to use it with Javascript. First call the NPM TensorflowJS module in your html code.
```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js"></script>
```
TensorflowJS uses Javascript *async/await* functions to request the model.
```javascript
const model = await tf.loadLayersModel('https://danielhallinan-mnist.s3.us-east-2.amazonaws.com/mnist/model.json');
```
The model is now loaded and can be used to make predictions. For our MNIST digit guessing model we will need to reshape and resize our canvas image to fit the (1, 28, 28) shape needed for input. Luckily TensorflowJS provides many useful functions for capturing web content, and reshaping and resizing similar to how you would numpy or tensorflow in Python. We capture the canvas from the browser and reduce it down from three dimensions to one using the following line:
```javascript
const image = tf.browser.fromPixels(canvas).mean(2).toFloat().expandDims(-1);
```
This turns the canvas image into a tensor with a shape of (224, 224, 1). Now we reduce it to (1, 28, 28) with this:
```javascript
const resizedImage = tf.image.resizeBilinear(image, [28,28]).reshape([1,28,28]);
```
And now make a prediction:
```javascript
const prediction = model.predict(resizedImage);
```
The prediction returns an array with a length of ten, just as the Keras model would. And we use an ArgMax function to determine which unit of the array most likely represents the digit:
```javascript
const answer = tf.argMax(prediction, 1).dataSync()[0];
```
Now the model is being served, and is being computed by the client.

<script type="text/javascript" src="/assets/js/mnistCanvas.js"></script>
