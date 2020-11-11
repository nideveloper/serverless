# The Waf API Gateway


This is a cdk stack to deploy a simple API gateway, and attach a WAF ( web applicaiton Firewall ) from Andrew Frazer ( <https://github.com/mrpackethead> ) .

![architecture](img/the-waf-apigateway.png)

This stack implements three stacks,  A 'Top' level stack from where 'component' stacks are nested.  This approach logically seperates resources together, allowing better code reuse, and overall understanding. 

The apigateway stack creates a trival REST apigateway, with a single method which returns 'hello-world' to a POST request. 
THe Waf stack creates a WAF WebACL and attaches it to the the apigateway.    It demonstrates a geo-matching rule, and the use of some AWS managed rulesets.    This waf stack could be used for any resource that you can attach a WAF rule to ( Such as a load balancer / Cloudfront distribution etc) simply by passing the resources ARN to the stack. 


# CDK Useful Commands

The `cdk.json` file tells the CDK Toolkit how to execute your app.

This project is set up like a standard Python project.  The initialization
process also creates a virtualenv within this project, stored under the .env
directory.  To create the virtualenv it assumes that there is a `python3`
(or `python` for Windows) executable in your path with access to the `venv`
package. If for any reason the automatic creation of the virtualenv fails,
you can create the virtualenv manually.

To manually create a virtualenv on MacOS and Linux:

```
$ python -m venv .env
```

After the init process completes and the virtualenv is created, you can use the following
step to activate your virtualenv.

```
$ source .env/bin/activate
```

If you are a Windows platform, you would activate the virtualenv like this:

```
% .env\Scripts\activate.bat
```

Once the virtualenv is activated, you can install the required dependencies.

```
$ pip install -r requirements.txt
```

At this point you can now synthesize the CloudFormation template for this code.

```
$ cdk synth
```

To add additional dependencies, for example other CDK libraries, just add
them to your `setup.py` file and rerun the `pip install -r requirements.txt`
command.

## Useful commands

 * `cdk ls`          list all stacks in the app
 * `cdk synth`       emits the synthesized CloudFormation template
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk docs`        open CDK documentation

Enjoy!

