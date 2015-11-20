module.exports = Accumulator;

/*
 * Accumulator - to keep user score with ability to display "delta" for last period
 * 
 */

function Accumulator(score) {

    var recentScore = 0;

    // Increment/decrement for some value
    // and return final value
    this.applyAndTakeScores = function(value) {
        score += value;
        this.score = score;
        recentScore += value;
        return this.takeScores();
    };

    // User may get 1 "gift score" at the beginning
    // This method is to reset this with penalization
    this.resetGift = function() {
        if (score == 1) {
            score = 0;
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
