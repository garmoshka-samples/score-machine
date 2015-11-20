module.exports = {
    calculateTerminationStrafe
};

var config = require('config');

/*
* Penalizes for improper dialog termination
* 
* For example, if chat started and we terminate chat after a while
* even without attempt to communicate.
* Or interlocutor asks us something and we are silent,
* so he got bored and left a chat.
*/

function calculateTerminationStrafe(side, byPartner, dialogDuration, heAwaited) {

    if (byPartner) {
        if (side.myRows == 0) return heGotBored();
    } else {
        if (side.hisRows == 0) return iGotBored();
    }

    function heGotBored() {
        var p = config.get('patience.partners');
        
        if (dialogDuration > p['adequateImpatience']) {
            if (side.hisRows > 0) {
                if (heAwaited > p['great']) 
                    return p['greatStrafe'];
                else if (heAwaited > p['normal']) 
                    return p['normalStrafe'];
                else if (heAwaited > p['low']) 
                    return p['lowStrafe'];
            } else {
                if (dialogDuration > p['greatPatience']) 
                    return p['greatSilentPatienceStrafe'];
            }
        }
    }

    function iGotBored() {
        var p = config.get('patience.my');
        if (side.myRows != 0) {
            p = p['normal'];
            
            if (dialogDuration < p['low'])
                return p['lowStrafe'];
            else if (dialogDuration < p['normal'])
                return p['normalStrafe'];
        } else {
            p = p['silent'];
            if (dialogDuration < p['low']) 
                return p['lowStrafe'];
            else if (dialogDuration < p['normal']) 
                return p['normalStrafe'];
            else 
                return p['greatStrafe'];
        }
    }

}