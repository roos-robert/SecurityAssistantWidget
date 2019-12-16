new Vue({
    el: '#app',
    data: {
    },
    methods: {
        checkPass: function(passwordCheck, sawPrompt, finishedTutorial, domain) { //sawprompt = user saw the password modal. finishedTutorial= if user completed the tutoria. Bools
            var estimator = zxcvbn(passwordCheck, user_inputs=[]);

           axios({
            method: 'post',
            url: '/api/NewStatistics/',
            data: {
                'passwordLength': passwordCheck.length,
                'numbers': passwordCheck.replace(/[^0-9]/g,"").length,
                'upperCases': passwordCheck.replace(/[^A-Z]/g, "").length,
                'lowerCases': lowerCases = passwordCheck.replace(/[^a-z]/g, "").length,
                'specialCharacters': passwordCheck.replace(/[^@#$%^&!*()_+\-=\[\]{};':"\\|,.<>\/?]/g, "").length,
                'domain': domain,
                'sawPrompt': sawPrompt,
                'finishedTutorial': finishedTutorial,
                'offlineFastHashing1e10PerSecond': estimator.crack_times_seconds.offline_fast_hashing_1e10_per_second,
                'offlineSlowHashing1e4PerSecond': estimator.crack_times_seconds.offline_slow_hashing_1e4_per_second,
                'onlineNoThrottling10PerSecond': estimator.crack_times_seconds.online_no_throttling_10_per_second,
                'onlineThrottling100PerSecond': estimator.crack_times_seconds.online_throttling_100_per_hour,
                'offlineFastHashingDisplay': estimator.crack_times_display.offline_fast_hashing_1e10_per_second,
                'offlineSlowHashingDisplay': estimator.crack_times_display.offline_slow_hashing_1e4_per_second,
                'onlineNoThrottlingDisplay': estimator.crack_times_display.online_no_throttling_10_per_second,
                'onlineThrottlingDisplay': estimator.crack_times_display.online_throttling_100_per_hour,
                'calcTime': estimator.calc_time,
                'guesses': estimator.guesses,
                'score': estimator.score,
                'suggestions': estimator.feedback.suggestions.join(),
                'warnings': estimator.feedback.warning
            }
            }).then(response => {

            }).catch(function (error) {
            console.log(error);
            });
        },  
    },
    mounted: function () { 
    }
});
