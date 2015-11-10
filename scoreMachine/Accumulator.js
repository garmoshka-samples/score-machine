module.exports = Accumulator;

function Accumulator(score) {

    var recentScore = 0;

    this.applyAndTakeScores = function(value) {
        score += value;
        this.score = score;
        recentScore += value;
        //console.log(score, recentScore);
        return this.takeScores();
    };

    this.resetGift = function() {
        if (score == 1) {
            score = 0; // Сбрасываем подарочный очек
            this.score = score;
        }
    };

    this.getScore = function() {
        return score;
    };

    this.takeScores = function() {
        var result = {
            score: Math.round(score),
            recentScore: Math.round(recentScore)
        };
        recentScore = 0;
        return result;
    };

}
