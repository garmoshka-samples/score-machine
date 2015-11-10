module.exports = {
    analyze: analyze
};

function analyze(side, byPartner, duration, heAwaited) {

    if (byPartner) {
        if (side.myRows == 0) return heGotBored();
    } else {
        if (side.hisRows == 0) return iGotBored();
    }

    function heGotBored() {
        // Если он устал быстрее, чем за 10 секунд - это он дурак
        // иначе:
        if (duration > 10) {
            if (side.hisRows > 0) {
                // Он очень терпелив был - это очень некрасиво
                if (heAwaited > 50) return 7;
                // Какого хрена тормозишь?
                else if (heAwaited > 25) return 3;
                // Ты слишком медленный, будь по-шустрей
                else if (heAwaited > 10) return 1;
            } else {
                // Можно было и первому начать, брат
                if (duration > 50) return 3;
            }
        }
    }

    function iGotBored() {
        if (side.myRows == 0) {
            // Если мы отключились, даже ничего не написав - это лютый ахтунг
            if (duration < 10) return 10;
            // подождал мало, даже погоды у моря хуево ждешь:
            else if (duration < 50) return 6;
            // Ждешь у моря погоды. Провоцируй людей
            else return 3;
        } else {
            // Слишком нетерпеливые
            if (duration < 10) return 5;
            // можно было и подождать минутку
            else if (duration < 50) return 1;
        }
    }

}