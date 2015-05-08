# [AngularJS](http://angularjs.org) directives for Wizards that have flow control

## Demo:

[Here: http://quanla.github.io/angular-flow-wizard/](http://quanla.github.io/angular-flow-wizard/)

## Description:
This allows creating complex wizards that have loop steps or conditional steps - similar to flow control of any programming language.

> **Disclaimer**: If your wizard is simple, with a fixed list of steps, and user is forced to proceed all of them, then consider using simpler solution, mere usage of UI-Router may already be enough.

## Explanation:

When user proceeds with a wizard step, he/she can input data that would affect the flow of all other steps: next step can be skipped, or several steps need to be looped for each element of a collection. 

This complex flow control can be very difficult to simulate and would be error-prone. Even if you can come up with a "good" solution that allow a step to decide which step will be next after this, you will end up with codes similar to ancient GOTOs.

This library has support for call stack, peeking next step, previous step, so you can easily configure and control the flow of your wizard steps.

## Installation:

 - Through Bower: `bower install angular-flow-wizard`
 - Through Github: [http://quanla.github.io/angular-flow-wizard/wizard/wizard.min.js](http://quanla.github.io/angular-flow-wizard/wizard/wizard.min.js)

## Usage:

Include wizard.js in your application.

    <script src="components/wizard/wizard.js"></script>

Add the module `flowwizard` as a dependency to your app module:

    var myapp = angular.module('myapp', ['flowwizard']);

Configure your wizard steps in controller:

    .controller("examples.phone-order.Ctrl", function($scope, Wizards) {
        $scope.order = {
            phones: []
        };

        function step(stepName) {
            return {
                controller: "examples.phone-order." + stepName + ".Ctrl",
                templateUrl: "examples/phone-order/" + stepName + "/" + stepName + ".html"
            };
        }

        $scope.wizard = Wizards.create($scope, [
            step("step1"),
            {
                loop: "order.phones",
                indexAs: "phoneIndex",
                elementAs: "phone",
                then: [
                    step("step2"),
                    {
                        "if": "phone.customBuild",
                        then: [
                            step("step3")
                        ]
                    }
                ]
            }
        ]);

    })

Add container for the wizard in your template:

    <div flow-wizard="wizard"></div>
*(Note that the wizard content and "Next Step"/"Prev Step" buttons are independent, this allows flexibly layout your wizard)*

Add your "Next Step" button (below your wizard container):

    <button ng-if="wizard.hasNextStep()" ng-click="wizard.nextStep()">
        Next Step
    </button>

And "Prev Step" button:

    <button ng-if="wizard.hasPrevStep()" ng-click="wizard.prevStep()">
        Prev Step
    </button>

And "Finish" button:

    <button ng-if="!wizard.hasNextStep()" ng-click="wizard.nextStep()">
        Finish
    </button>

Remember to declare the corresponding steps' controller and template files

## Example:

### Phone ordering wizard:
Here is an example of a complex wizard that need flow control. [DEMO here](http://quanla.github.io/angular-flow-wizard/)


    1. Step 1: Ask user how many phones he/she want to order
    2. Loop for each phone on the order
	    1. Step 2: Ask for what phone type, and if he/she want to custom build it
	    2. If user want to custom build the phone
		    1. Choose phone color
		    2. Choose phone size
		    3. Choose chipset
		    4. ...


## Dependencies:

This library has no dependency except for AngularJS itself. However if JQuery is presented, you can add fade in/out animation effect to your wizard.
