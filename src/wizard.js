"use strict";

(function () {

    angular.module('flowwizard', [
    ])
        .factory("Wizards", function($compile, $templateCache, $http, $controller) {
            return {
                create: function($scope, sequence) {

                    var wizardStack = new ExecStack(sequence, function(str) { return $scope.$eval(str); });

                    var finished = false;
                    var changing = false;
                    var valid = true;

                    var currentStep = null;

                    var removeCurrentStep;

                    function loadStep(step, wizardScope, done) {

                        var templatePromise = $http.get(step.templateUrl, {cache: $templateCache}).then(function (result) {return result.data;});

                        var removeStep;
                        var cancelled = false;

                        templatePromise.then(function(content) {
                            if (cancelled) return;

                            var stepScope = wizardScope.$new();
                            $controller(step.controller, {
                                $scope: stepScope,
                                $wizardStepSetup: function(stepConfig1) {
                                    currentStep = Object.create(step);
                                    ObjectUtil.copy(stepConfig1, currentStep);
                                }
                            });
                            if (currentStep == null) {
                                currentStep = Object.create(step);
                            }
                            currentStep.contentEl = function() {
                                return $compile(angular.element(content))(stepScope);
                            };

                            removeStep = function () {
                                stepScope.$destroy();
                                currentStep = null;
                            };

                            if (done) done(stepScope);
                        });

                        return function() {
                            cancelled = true;
                            if (removeStep) removeStep();
                        };
                    }

                    function reload() {

                        if (removeCurrentStep) {
                            removeCurrentStep();
                            removeCurrentStep = null;
                        }

                        if (wizardStack.stack != null) {
                            changing = true;

                            wizardStack.setVariables(function(name, value) {
                                $scope[name] = value;
                            });

                            removeCurrentStep = loadStep(wizardStack.getCurrentStep(), $scope, function(stepScope) {
                                changing = false;

                                if (currentStep.valid) {
                                    stepScope.$watch(currentStep.valid, function(valid1) {
                                        valid = valid1;
                                    });
                                }

                            });
                        }
                    }

                    reload();

                    return {
                        get changing() {
                            return changing;
                        },
                        get finished() {
                            return finished;
                        },
                        get valid() {
                            return valid;
                        },
                        get currentStep() {
                            return currentStep;
                        },
                        nextStep: function() {
                            if (currentStep.save) {
                                currentStep.save();
                            }

                            var peekNextStep = wizardStack.peekNextStep();
                            if (peekNextStep == null) {
                                finished = true;
                            } else {
                                wizardStack.stack = peekNextStep;
                            }
                            reload();
                        },
                        prevStep: function() {
                            var peekPrevtStep = wizardStack.peekPrevStep();
                            wizardStack.stack = peekPrevtStep;

                            reload();
                        },
                        hasPrevStep: function() {
                            return wizardStack.peekPrevStep() != null;
                        },
                        hasNextStep: function() {
                            return wizardStack.peekNextStep() != null;
                        },
                        toStep: function(stack) {
                            wizardStack.stack = stack;
                            reload();
                        }
                    };
                }
            };
        })

        .directive("flowWizard", function() {
            return {
                restrict: "A",
                link: function($scope, elem, attrs) {
                    var aniStart = function(done) {
                        setTimeout(done, 0);
                    };
                    var aniEnd = function() {};

                    var fade = elem.closest("[wz-fade]");
                    if (fade.length > 0) {
                        aniStart = function(done) {
                            fade.fadeOut(200, done);
                        };
                        aniEnd = function() {
                            fade.fadeIn(200);
                        };
                    }

                    function animate(exec, done) {
                        aniStart(function() {
                            exec();
                            done();
                            aniEnd();
                        });
                        return {
                            set exec(e) {
                                exec = e;
                            }
                        };
                    }

                    var removePreviousContent;
                    var animation;

                    $scope.$watch(attrs.fmtWizard + ".currentStep.contentEl", function(contentEl) {
                        var reload = function() {
                            if (removePreviousContent) {
                                removePreviousContent();
                                removePreviousContent = null;
                            }

                            if (contentEl) {
                                var el = contentEl();
                                $scope.$apply(function() {
                                    elem.append(el);
                                });
                                removePreviousContent = function () {
                                    el.remove();
                                    elem.html("");
                                };
                            }
                        };

                        if (animation == null) {
                            animation = animate(
                                reload,
                                function() {
                                    animation = null;
                                }
                            )
                        } else {
                            animation.exec = reload;
                        }

                    });
                }
            };
        })
    ;

})();