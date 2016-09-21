"use strict";

(function () {
    // #include "common-utils.js"
    // #include "ExecStack.js"

    angular.module('flowwizard', [
    ])
        .factory("Wizards", function($compile, $templateCache, $http, $controller) {
            function noAnimation() {
                return {
                    start: function(cleanup) {
                        cleanup();
                        return null;
                    }
                };
            }

            return {
                create: function($scope, sequence) {
                    var animationProvider = noAnimation();

                    var wizardStack = new ExecStack(sequence, $scope);
                    var finished = false;
                    var valid = true;

                    var currentStep = null;

                    var removeCurrentStep;

                    function loadTemplate(step, wizardScope, done) {

                        var templatePromise = $http.get(step.templateUrl, {cache: $templateCache}).then(function (result) {return result.data;});

                        templatePromise.then(function(content) {

                            var stepScope = wizardScope.$new();
                            var stepConfig = null;
                            $controller(step.controller, {
                                $scope: stepScope,
                                $wizardStepSetup: function(stepConfig1) {
                                    stepConfig = Object.create(step);
                                    ObjectUtil.copy(stepConfig1, stepConfig);
                                }
                            });
                            if (stepConfig == null) {
                                stepConfig = Object.create(step);
                            }

                            var el = $compile(angular.element(content))(stepScope);

                            if (done) done(stepScope, el, stepConfig);
                        });

                    }

                    var animation;
                    function reload(stack) {

                        if (removeCurrentStep) {
                            var removing = removeCurrentStep;
                            removeCurrentStep = null;
                            animation = animationProvider.start(removing, function() {
                                animation = null;
                            });
                        }

                        if (stack != null) {
                            loadTemplate(wizardStack.getStep(stack), $scope, function(stepScope, el, stepConfig) {
                                var toLoadTemplate = function() {
                                    currentStep = stepConfig;
                                    currentStep.contentEl = el;
                                    wizardStack.stack = stack;

                                    wizardStack.setVariables($scope);

                                    if (currentStep.valid) {
                                        stepScope.$watch(currentStep.valid, function(valid1) {
                                            valid = valid1;
                                        });
                                    }

                                    removeCurrentStep = function() {
                                        currentStep = null;
                                        valid = true;
                                        stepScope.$destroy();
                                    };
                                };
                                if (animation != null) {
                                    animation.mainExec(toLoadTemplate);
                                } else {
                                    toLoadTemplate();
                                }
                            });
                        }
                    }

                    reload(wizardStack.stack);

                    return {
                        get finished() {
                            return finished;
                        },
                        get valid() {
                            return valid;
                        },
                        get currentStep() {
                            return currentStep;
                        },
                        set animationProvider(ap) {
                            animationProvider = ap;
                        },
                        nextStep: function() {
                            if (currentStep.save) {
                                currentStep.save();
                            }

                            var peekNextStep = wizardStack.peekNextStep();
                            if (peekNextStep == null) {
                                finished = true;
                                reload(null);
                            } else {
                                reload(peekNextStep);
                            }

                        },
                        prevStep: function() {
                            reload(wizardStack.peekPrevStep());
                        },
                        hasPrevStep: function() {
                            return wizardStack.peekPrevStep() != null;
                        },
                        hasNextStep: function() {
                            return wizardStack.peekNextStep() != null;
                        },
                        toStep: reload
                    };
                }
            };
        })

        .directive("wzFade", function() {

            function fadeAnimation(fade, apply) {
                return {
                    start: function(cleanup, done) {
                        var main;
                        var ready = false;

                        fade.fadeOut(200, function() {
                            cleanup();

                            if (main != null) {
                                apply(main);
                                fade.fadeIn(200);
                                done();
                            } else {
                                ready = true;
                            }
                        });

                        return {
                            mainExec: function(main1) {
                                if (ready) {
                                    apply(main1);
                                    fade.fadeIn(200);
                                    done();
                                } else {
                                    main = main1;
                                }
                            }
                        };
                    }
                };
            }

            return {
                restrict: "A",
                link: function($scope, elem, attrs) {
                    var wizard = $scope.$eval(attrs.wzFade);

                    wizard.animationProvider = fadeAnimation(elem, function(a) {$scope.$applyAsync(a);});
                }
            };
        })

        .directive("flowWizard", function($compile) {
            return {
                restrict: "A",
                link: function($scope, elem, attrs) {
                    var removePreviousContent;

                    $scope.$watch(attrs.flowWizard + ".currentStep.contentEl", function(contentEl) {
                        if (removePreviousContent) {
                            removePreviousContent();
                            removePreviousContent = null;
                        }

                        if (contentEl) {
                            elem.append(contentEl);
                            $compile(contentEl)($scope);

                            removePreviousContent = function () {
                                contentEl.remove();
                                elem.html("");
                            };
                        }
                    });
                }
            };
        })
    ;

})();
