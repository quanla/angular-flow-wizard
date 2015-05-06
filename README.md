# [AngularJS](http://angularjs.org) directives for Wizards that have flow control

## Demo:

[Here: http://quanla.github.io/angular-flow-wizard/](http://quanla.github.io/angular-flow-wizard/)

## Description:
Flow wizards allow you to create wizards and configure its steps in the way that is similar to programming, with conditional block of steps (if-then) and loops of steps. 

> **Disclaimer**: If your wizard is simple, with a fixed list of steps, then consider using simpler solution. Mere usage of UI-Router may already be enough.

## Explanation:

When user proceeds with a wizard step, he/she can input data that would affect the flow of all other steps: next step can be skipped, or several steps need to be looped for each element of a collection. 

This complex flow control can be very difficult to simulate and would be error-prone. Even if you can come up with a "good" solution that allow a step to decide which step will be next after this, you will end up with codes similar to ancient GOTOs.

This library has support for call stack, peeking next step, previous step, so you can easily configure and control the flow of your wizard steps.

## Example:

### Phone ordering wizard:
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
