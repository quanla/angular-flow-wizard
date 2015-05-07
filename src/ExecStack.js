"use strict";

function ExecStack(sequence, evaluate) {
    this.sequence = sequence;
    this.stack = [
        {
            at: 0
        }
    ];
    this.eval = evaluate;
}
ExecStack.prototype = {
    getList: function(parent) {
        return parent ? parent.then : this.sequence;
    },
    getCurrentStep: function() {
        return this.getStep(this.stack);
    },
    getStep: function(stack, mod) {
        var lookingAt;
        for (var i = 0; i < (mod == null ? stack.length : mod < 0 ? stack.length + mod : mod); i++) {
            var s = stack[i];
            lookingAt = this.getList(lookingAt)[s.at];
        }
        return lookingAt;
    },
    peekNextStep: function() {
        return this.tryChangeStep(true);
    },
    peekPrevStep: function() {
        return this.tryChangeStep(false);
    },
    setVariables: function(setter) {
        for (var i = 0; i < this.stack.length; i++) {
            var s = this.stack[i];

            if (s.loopIndex != null) {
                var step = this.getStep(this.stack, i);
                setter(step.elementAs, this.eval(step.loop)[s.loopIndex]);
                setter(step.indexAs, s.loopIndex);
            }
        }
    },
    tryChangeStep: function(advancing) {
        var me = this;

        function changeStep(mod) {
            var ret = ObjectUtil.clone(me.stack);
            ret[ret.length - 1].at += mod ;
            return ret;
        }

        var assume = changeStep(advancing ? +1 : -1);

        function isExceedEndSequence() {
            return assume[assume.length - 1].at > me.getList(me.getStep(assume, -1)).length - 1;
        }
        function isBeforeStartSequence() {
            return assume[assume.length - 1].at < 0;
        }

        function isInLoop() {
            return isLoop(me.getStep(assume, -1));
        }
        function checkAdvancingParentLoopCond() {
            var loopStep = me.getStep(assume, -1);

            var col = me.eval(loopStep.loop);

            var s = assume[assume.length - 1];

            return s.loopIndex + 1 <= col.length - 1;
        }
        function checkBackingParentLoopCond() {
            var s = assume[assume.length - 1];

            return s.loopIndex > 0;
        }
        function isLoop(step) {
            return step.loop != null;
        }

        function checkLoopCond(step) {
            var col = me.eval(step.loop);
            return Cols.isNotEmpty(col);
        }
        function checkIfCond(step) {
            return me.eval(step.if);
        }

        function isIf(step) {
            return step.if != null;
        }

        for (;;) {
            if (isBeforeStartSequence()) {
                if (assume.length == 1) {
                    // in nothing, end!
                    return null;
                } else if (isInLoop()) {
                    if (checkBackingParentLoopCond()) {
                        // Looping
                        assume[assume.length - 1].loopIndex--;
                        var parentStep = me.getStep(assume, -1);
                        assume[assume.length - 1].at = me.eval(parentStep.loop).length - 1;

                    } else {
                        // Out of loop
                        assume.splice(assume.length - 1, 1);
                        assume[assume.length - 1].at--;
                    }
                } else {
                    // Is in if block
                    assume.splice(assume.length - 1, 1);
                    assume[assume.length - 1].at--;
                }
            } else if (isExceedEndSequence()) {
                if (assume.length == 1) {
                    // in nothing, end!
                    return null;
                } else if (isInLoop()) {
                    if (checkAdvancingParentLoopCond()) {
                        // Looping
                        assume[assume.length - 1].loopIndex++;
                        assume[assume.length - 1].at = 0;
                    } else {
                        // Out of loop
                        assume.splice(assume.length - 1, 1);
                        assume[assume.length - 1].at++;
                    }
                } else {
                    // Is in if block
                    assume.splice(assume.length - 1, 1);
                    assume[assume.length - 1].at++;
                }

            } else {
                var step = me.getStep(assume);
                if (isIf(step)) {
                    if (checkIfCond(step)) {
                        assume.push({
                            at: (advancing ? 0 : step.then.length - 1)
                        });
                    } else {
                        // Go on, skip if
                        assume[assume.length - 1].at += advancing ? 1 : -1;
                    }
                } else if (isLoop(step)) {
                    if (checkLoopCond(step)) {
                        assume.push({
                            at: (advancing ? 0 : step.then.length - 1),
                            loopIndex: (advancing ? 0 : me.eval(step.loop).length - 1)
                        });
                    } else {
                        // Go on, skip loop
                        assume[assume.length - 1].at += advancing ? 1 : -1;
                    }
                } else {
                    // Normal step
                    return assume;
                }
            }
        }
    }
};