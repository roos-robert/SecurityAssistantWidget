// Server-URL with static files
//var serverURL = "https://lab.xenolith.se/";
 var serverURL = "./";
// Lab-settings for SA
const securityAssistantParameters = document.querySelector('#securityAssistant');

// Function for appending to body
function append(elString, parent) {
    var div = document.createElement("div");
    div.innerHTML = elString;
    document.querySelector(parent || "body").appendChild(div.firstChild);
}
 

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Init for the dependencies for the chat to work
function initDependencies() {
    append('<link id="secAssistantStyleSheet" rel="stylesheet" type="text/css" href="'+serverURL+'css/securityAssistant.css">', 'body');
    append('<script type="text/x-template" id="modal-template"> <transition name="secAssistant-modal"> <div class="secAssistant-modal-mask">'
    + '<div class="secAssistant-modal-wrapper"> <div class="secAssistant-modal-container"> '
    + ' <div class="secAssistant-modal-header">  <div style="float: right"><a class="btn-secAssistant btn-danger-secAssistant" @click="$emit(\'close\')"> X </a></div><slot name="header">  </slot>'
    + '</div> <div class="secAssistant-modal-body" id="modalContent"> <slot name="summary"> default body </slot> <slot name="generator"> </slot> <slot name="quiz"> </slot> <slot name="buttons"> </slot> <p></p> ' 
    + '<slot name="body"> default body </slot> </div> <div class="secAssistant-modal-footer"> <slot name="footer">  <p>&nbsp;</p></slot> </div> </div> </div> </div> </transition></script>', 'body');
    
    org_html = document.body.innerHTML;
    new_html = "<div id='app'>" + org_html + "</div>";
    document.body.innerHTML = new_html;

    var htmlInjection = '<modal v-if="showModal" @close="showModal = false"><div slot="header"> <h2 class="secAssistant-modal-h2">{{ this.modalHeader }}</h2> </div><div slot="summary" v-html="this.modalSummary"></div>'
    + '<div slot="generator" v-if="showGenerator"> <div class="form-group"><label for="exampleInputPassword1">Choose your password, use at least four (4) words</label>'
    + '<input type="password" class="form-control" :value="passwordUser" @input="passwordUser = $event.target.value" id="exampleInputPassword1" placeholder="Password"><br /><vue-simple-progress size="huge" :val="pwStrengthValue" :bar-color="pwStrengthColor" :text="pwStrengthText"></vue-simple-progress><label v-if="false" for="exampleInputPassword1">Detta ord läggs automatiskt på</label>'
    + '<input v-if="false" type="text" class="form-control" v-model="passwordAutoWord" id="exampleInputPassword1" disabled></div><p v-if="false">Antal ord {{ this.calculateWords }} </p><p v-if="false">Ditt lösenord blir: {{ this.generatedPassword }}</p><br /></div>'
    + '<div slot="quiz" v-if="activeQuiz"> <div><p></p><h4 class="secAssistant-header-h4">{{ questions[this.activeQuestion].text }}</h4></div> <div class="list-group"><a style="cursor: pointer;" class="list-group-item list-group-item-action" v-for="(answer, index) in questions[this.activeQuestion].answers" @click="checkAnswer(index)"> {{ answer }} </a></div> <p>&nbsp;</p> <div v-if="showFeedback"> {{ feedback}} </div> <p>&nbsp;</p> </div>'
    +'<div slot="buttons">'
    + '<div style="float: left;"><a class="btn-secAssistant btn-primary-secAssistant" @click="guideStepNext" v-if="this.guideNavButton !== \'\'"> {{ guideNavButton }} </a> &nbsp; &nbsp; <a class="btn-secAssistant btn-warning-secAssistant" @click="goToGenerator()" v-if="this.skipGuideNavButton !== \'\'"> {{ skipGuideNavButton }} </a></div> <div style="clear:both;"></div> </div> <div slot="body" v-html="this.modalBody"></div> </modal>';

    append(htmlInjection, '#app');
    
    initVue(); // Connecting the Vue instance to the newly appended DOM elements
}

function initVue() {
    Vue.component('modal', {
        template: '#modal-template'
    });

    var vm = new Vue({
        el: '#app',
        components: { // External components, references
        },
        data: { // Variables for holding/manipulating data
            activeQuestion: 0,
            activeQuiz: false,
            passwordInputFields: [],
            submitForm: [],
            passwordAutoWord: "",
            passwordUser: "",
            showModal: false,
            showFeedback: false,
            showGenerator: false,
            feedback: "",
            generatedPassword: "",
            modalHeader: "Password tutorial",
            modalSummary: "",
            modalBody: "",
            guideCompleted: false,
            guideStep: 0,
            guideNavButton: "Start guide",
            //pwStrengthValue: 0,
            pwStrengthValueDropbox: 0,
            pwStrengthColor: '#2196f3',
            pwStrengthText: '',
            skipGuideNavButton: "Create password now",
            sawModal: false,
            questions: [
                {
                  "text": "Which one of the following is the best password?",
                  "type": "mc",
                  "answers": [
                    "1. Your name or social security number",
                    "2. OneprettybluechairFacebook",
                    "3. ASFD#%T#GT%#Y¤GW#G%¤#",
                  ],
                  "answer": 1, // Starting from 0!
                  "feedback": [
                      "Wrong, never use information about yourself in your password. It's the first thing a hacker will test!",
                      "Correct! 🎉",
                      "Even if it's long, it's hard to remember without writing it down. Only use this type of password if you can memorize it."
                  ]
                },
                {
                  "text": "What's the most important when choosing a password?",
                  "type": "mc",
                  "answers": [
                    "1. That the password is long and easy to remember",
                    "2. That the password is completely randomized",
                    "3. That the password contains information about yourself"
                  ],
                  "answer": 0,
                  "feedback": [
                    "Correct! 🎉",
                    "Completely randomized passwords may sound good, but are hard to remember. Only use this type of password if you can memorize it.",
                    "Wrong, never use information about yourself in your password. It's the first thing a hacker will test!"
                ]
                },
                {
                    "text": "How should you handle your passwords?",
                    "type": "mc",
                    "answers": [
                      "1. Write them down on paper to remember them",
                      "2. Use the same password for all accounts but change it often",
                      "3. Use unique passwords for your accounts, but make them easy to remember"
                    ],
                    "answer": 2,
                    "feedback": [
                        "Never write down your passwords, an attacker could find the paper or the file! Instead create passwords that are easy to remember by using a sentence with at least four words.",
                        "Using the same password on various sites is dangerous. If a hacker attacks a site and gets your password he will be able to log in to all of your accounts. Changing passwords often makes them hard to remember and is not recommended anymore by leading organizations.",
                        "Correct! 🎉 Instead use a phrase with at least four words, followed by the site it\'s being used. For examle OneTinyLittleTreeFacebook."
                    ]
                  }
              ]
            // questions: [
            //     {
            //       "text": "Vilket av följande är bäst lösenord?",
            //       "type": "mc",
            //       "answers": [
            //         "1. Ditt namn eller personnummer",
            //         "2. EnfinblåstolFacebook",
            //         "3. ASFD#%T#GT%#Y¤GW#G%¤#",
            //       ],
            //       "answer": 1, // Starting from 0!
            //       "feedback": [
            //           "Fel, använd aldrig information om dig själv i ditt lösenord, det är det första en hacker provar!",
            //           "Helt rätt, du har koll på läget!",
            //           "Även om det är långt så är det svårt att komma ihåg utan att skriva ner det. Använd bara denna typ av lösenord om du kan memorera dem."
            //       ]
            //     },
            //     {
            //       "text": "Vad är viktigast för att välja ett bra lösenord?",
            //       "type": "mc",
            //       "answers": [
            //         "1. Att det är långt och lätt att komma ihåg.",
            //         "2. Att det är helt slumpmässigt.",
            //         "3. Att det innehåller information om dig själv."
            //       ],
            //       "answer": 0,
            //       "feedback": [
            //         "Helt rätt, du har koll på läget!",
            //         "Helt slumpade lösenord kanske låter bra, men är svårt att koma ihåg. Använd bara denna typ av lösenord om du kan memorera dem.",
            //         "Använd aldrig information om dig själv i ditt lösenord, det är det första en hacker provar!"
            //     ]
            //     },
            //     {
            //         "text": "Vad är rätt om hur du bör hantera dina lösenord?",
            //         "type": "mc",
            //         "answers": [
            //           "1. Skriva ner dem för att alltid komma ihåg dem",
            //           "2. Använd samma lösenord för alla konton, men byt ofta.",
            //           "3. Använd unika lösenord för dina olika konton men gör dom lätta att komma ihåg."
            //         ],
            //         "answer": 2,
            //         "feedback": [
            //             "Skriv aldrig ner dina lösenord, en angripare kan hitta lappen eller filen! Gör hellre lösenord som är lätta att komma ihåg genom att använda meningar med minst fyra ord som lösenord.",
            //             "Att använda samma lösenord på flera ställen är farligt, om en angripare hackar en sida kan han komma in på alla dina konton. Att ofta byta lösenord gör att det är svårt att komma ihåg vilket lösenord som går vart och är inte längre rekommenderat av ledande organisationer.",
            //             "Helt rätt, använd exempelvis en fras med minst fyra ord följt av den tjänst där lösenordet används, exempelvis EnLitenRosaBollJobbet"
            //         ]
            //       }
            //   ]
        },
        methods: { // Methods to call and run processes in
            addListenersToPasswordInputFields: function() { // Adding event listeners to all password fields              
                var that = this;
                //This is for research purpouses only, disable by setting to 1 === 2, 0.5 for 50/50
                var cat = getRandomInt(100) >= parseInt(securityAssistantParameters.dataset.frequency);
                console.log(cat)

                if(cat) {
                    this.submitForm[0][0].addEventListener("submit", function(e) {
                        var form = this;
                        var submittedPassword = "";
                        e.preventDefault();
                        
                        for (var i = 0; i < form.length; i++)
                        {
                            if(form[i].type === "password") {
                                submittedPassword = form[i].value;
    
                                break;
                            }
                        }
    
                        if(submittedPassword !== "")
                        {
                            if(window.location.hostname !== '') {
                                that.passwordAutoWord = that.parseDomain(window.location.hostname);
                            }
                            else {
                                that.passwordAutoWord = "Unknown";
                            }
                            
                            that.sendTelemetrics(submittedPassword, that.sawModal, that.guideCompleted, that.passwordAutoWord);
                        }
    
                        setTimeout(function () {
                            
                            form.submit();
                        }, 2500); // in milliseconds
                    });
                }
                else {
                    if (this.sessionStorageCheck() !== true) {
                        for (var i = 0; i < this.passwordInputFields.length; i++)
                        {
                            this.passwordInputFields[i].addEventListener('focus', function() {
                                //that.sessionStorageAdd(); // Adding the current page to SS, to remember if the guide was shown here before
                                that.showModal = true;
                                if(!that.activeQuiz && !that.showGenerator) {
                                    if(that.guideCompleted)
                                    {
                                        that.goToGenerator();
                                    }
                                    else{
                                        that.modalHeader = "Password tutorial";
                                        that.guideNavButton = "Learn more";
                                        // that.modalSummary = '<img class="modalImage" src="'+serverURL+'img/authentication.svg" /><h4 class="secAssistant-header-h4">Ett bra lösenord är lätt att komma ihåg och svårt att knäcka!</h4>'
                                        // + '<p>Det löser du med en fras som är <strong>minst fyra ord lång</strong>. Kom ihåg att <strong>inte använda personlig information som namn eller personnummer</strong> i ditt lösenord.</p>'
                                        // + '<p>Vill du lära dig mer om bra lösenord, eller skapa ditt lösenord direkt?</p>'
                                        // + '<p>&nbsp;</p>'
                                        // + '';
                                        that.modalSummary = '<img class="modalImage" src="'+serverURL+'img/authentication.svg" /><h4 class="secAssistant-header-h4">A good password is easy to remember and hard to crack!</h4>'
                                        + '<p>You can achieve this by using a phrase <strong>at least four words</strong> long. Remember to never <strong>use any personal information such as social security numbers or names</strong> in your passwords.</p>'
                                        + '<p>Do you want to learn more about creating a good password, or jump straight to creating it?</p>'
                                        + '<p>&nbsp;</p>'
                                        + '';
                                        that.modalBody = '';
                                        that.guideStep = 1;
                                        that.sawModal = true;
                                    }
                                }
                            });
    
                            break;
                        }

                        this.submitForm[0][0].addEventListener("submit", function(e) {
                            var form = this;
                            var submittedPassword = "";
                            e.preventDefault();
                            
                            for (var i = 0; i < form.length; i++)
                            {
                                if(form[i].type === "password") {
                                    submittedPassword = form[i].value;
        
                                    break;
                                }
                            }
        
                            if(submittedPassword !== "")
                            {
                                if(window.location.hostname !== '') {
                                    that.passwordAutoWord = that.parseDomain(window.location.hostname);
                                }
                                else {
                                    that.passwordAutoWord = "Unknown";
                                }
                                
                                that.sendTelemetrics(submittedPassword, that.sawModal, that.guideCompleted, that.passwordAutoWord);
                            }
        
                            setTimeout(function () {
                                
                                form.submit();
                            }, 2500); // in milliseconds
                        });
                    }
                }
            },
            checkAnswer: function(answer) {
                //console.log("answer: " + answer);
                var match = this.questions[this.activeQuestion].answer === answer;

                this.showFeedback = true;
                this.feedback = this.questions[this.activeQuestion].feedback[answer];

                if(match) {
                    this.guideNavButton = "Next question";
                }
                else {
                    this.guideNavButton = "";
                }

                //console.log(match);
            },
            checkPass: function(passwordCheck, sawPrompt, finishedTutorial, domain) { //sawprompt = user saw the password modal. finishedTutorial= if user completed the tutoria. Bools
                var estimator = zxcvbn(passwordCheck, user_inputs=[]);
    
               axios({
                method: 'post',
                url: 'https://sa.xenolith.se/api/NewStatistics/',
                data: {
                    'passwordLength': passwordCheck.length,
                    'numbers': passwordCheck.replace(/[^0-9]/g,"").length,
                    'upperCases': passwordCheck.replace(/[^A-Z]/g, "").length,
                    'lowerCases': lowerCases = passwordCheck.replace(/[^a-z]/g, "").length,
                    'specialCharacters': passwordCheck.replace(/[^@#$%^&!*()_+\-=\[\]{};':"\\|,.<>\/?]/g, "").length,
                    'domain': domain,
                    'fullDomain': document.location.href,
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
            findAllPasswordInputFields: function(callback) { // Iterating through all passwords field in a page, adding to array

                const forms = document.querySelectorAll('form');

                if (forms.length !== 0) {

                    for (var i = 0; i < forms.length; i++) {
                        const form = forms[0];
                        var formHasPw = false;
                        var formHasUser = false;
        
                        if(form.length <= 3) {
                            [...form.elements].forEach((input) => {
                                if(input.type === "text" || input.type === "email")
                                {
                                    formHasUser = true;
                                }
                                else if (input.type === "password")
                                {
                                    formHasPw = true;
                                    this.passwordInputFields.push(input);
                                }
                            });
        
                            if(formHasUser && formHasPw) {
                                //console.log("This is a login form");
                                this.passwordInputFields = [];
                            }
                            else {
                                //console.log("This is NOT a registration form");
                            }
                        }
                        else {
                            [...form.elements].forEach((input) => {
                                if(input.type === "text" || input.type === "email")
                                {
                                    formHasUser = true;
                                }
                                else if (input.type === "password")
                                {
                                    formHasPw = true;
                                    this.passwordInputFields.push(input);
                                }
                                else if (input.type === "submit")
                                {
                                    //console.log("Submit button");
                                    this.submitForm.push(forms);
                                }
                            });
        
                            if(formHasUser && formHasPw) {
                                //console.log("This is a registration form");
                                
                            }
                            else {
                                //console.log("This is NOT a registration form");
                                this.passwordInputFields = [];
                                this.submitForm = [];
                            }
                        }
                    }
                }

                callback();
            },
            goToGenerator: function() {
                this.guideStep = 7;
                this.skipGuideNavButton = "";
                this.guideLoadNextStep();
            },
            guideStepNext: function() {
                this.guideStep += 1;
                this.guideLoadNextStep();
                //console.log("next" + this.guideStep);
            },
            guideLoadNextStep: function() {
                if(this.guideStep === 2)
                {
                    if(!this.activeQuiz && !this.showGenerator) {
                        document.getElementById('modalContent').scrollTop = 0;

                        this.modalSummary = '<img class="modalImage" src="'+serverURL+'img/password-strength.gif" /><p></p>'
                        + '<h4 class="secAssistant-header-h4">Create better passwords by making them longer!</h4>'
                        // + '<p>Ju fler ord desto bättre. Kom ihåg att <strong>aldrig skriva ner ditt lösenord</strong> på papper eller i någon fil på datorn.</p>'
                        // + '<p>Du kan även göra lösenordet unikt genom att lägga till vart det ska används.</p>'
                        // + '<p>I nästa steg får du <strong>testa dina kunskaper</strong>, innan du avslutningsvis får skapa ett nytt lösenord för denna site!</p>'
                        // + '<p>&nbsp;</p>'
                        // + '<p>&nbsp;</p>'
                        // + '';
                        + '<p>The more words the better. Remember to <strong>never write down your password</strong> on a piece of paper or on some file on your computer or phone.</p>'
                        + '<p>You can make the password unique by adding a word for where it\'s to be used, for example if the password is to be used on Facebook, adding the word "Facebook" to the password phrase.</p>'
                        + '<p>In the next step you will get to <strong>test your knowledge</strong>, before creating a new password for this site!</p>'
                        + '<p>&nbsp;</p>'
                        + '<p>&nbsp;</p>'
                        + '';

                        this.guideNavButton = "Take a quick quiz";
                        
                        
                        //console.log("Step 2");
                    }
                }
                else if(this.guideStep === 3)
                {
                    this.modalSummary = '';
                    this.guideNavButton = "";
                    this.activeQuiz = true;
                    this.skipGuideNavButton = "";

                    //console.log("Step 3");
                }
                else if(this.guideStep === 4)
                {
                    this.showFeedback = false;
                    this.modalSummary = '';
                    this.guideNavButton = "";
                    this.activeQuestion += 1;
                    this.activeQuiz = true;
                    //console.log("Step 4");
                }
                else if(this.guideStep === 5)
                {
                    this.showFeedback = false;
                    this.modalSummary = '';
                    this.guideNavButton = "";
                    this.activeQuestion += 1;
                    this.activeQuiz = true;
                    //console.log("Step 5");
                }
                else if(this.guideStep === 6) {

                    this.activeQuestion = 0;
                    this.activeQuiz = false;
                    this.showFeedback = false;

                    this.modalSummary = '<img class="modalImage" src="'+serverURL+'img/celebration.svg" />'
                    // + '<h3 class="secAssistant-header-h3">Bra jobbat!</h3>'
                    // + '<p>I nästa steg får du skapa ditt lösenord</p>'
                    // + '<p><strong>Se dig omkring och försäkra dig om att ingen ser din skärm innan du börjar!</strong></p>'
                    // + '<p>&nbsp;</p>'
                    // + '';
                    + '<h3 class="secAssistant-header-h3">Well done!</h3>'
                    + '<p>In the next step you get to create your new password.</p>'
                    + '<p><strong>Take a look around and make sure no one is looking at your screen before starting!</strong></p>'
                    + '<p>&nbsp;</p>'
                    + '';

                    this.guideNavButton = "Create your password";
                    this.skipGuideNavButton = "";

                    //console.log("Step 6");
                }
                else if(this.guideStep === 7)
                {
                    this.modalSummary = '';
                    this.showGenerator = true;
                    this.guideNavButton = "Use this password";
                    

                    if(window.location.hostname !== '') {
                        this.passwordAutoWord = this.parseDomain(window.location.hostname);
                    }
                    else {
                        this.passwordAutoWord = "Unknown";
                    }
                    //console.log("Step 7");
                }
                else if(this.guideStep === 8)
                {
                    var that = this;

                    if(this.pwStrengthValue < 40)
                    {
                        this.modalSummary = '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>'
                    + '<div style="text-align: center;"><h3 class="secAssistant-header-h3">All done! 🎉</h3><p>Your password could however be better, try adding another word.</p><p style="font-size: 12px;">This window will close in five seconds</p></div>';
                    }
                    else if(this.pwStrengthValue > 40 && this.pwStrengthValue < 66)
                    {
                        this.modalSummary = '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>'
                        + '<div style="text-align: center;"><h3 class="secAssistant-header-h3">Well done! 🎉</h3><p>You now have a good password, it can however be even better, try adding another word.</p><p style="font-size: 12px;">This window will close in five seconds</p></div>';
                    }
                    else if (this.pwStrengthValue > 66)
                    {
                        this.modalSummary = '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>'
                    + '<div style="text-align: center;"><h3 class="secAssistant-header-h3">Well done! 🎉</h3><p>You now have a secure password!</p><p style="font-size: 12px;">This window will close in five seconds</p></div>';
                    }
                    else
                    {
                        this.modalSummary = '<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>'
                    + '<div style="text-align: center;"><h3 class="secAssistant-header-h3">All done! 🎉</h3><p>Your chosen password is very weak and easy to crack, try adding a few more words.</p><p style="font-size: 12px;">This window will close in five seconds</p></div>';
                    }

                    this.showFeedback = false;
                    this.showGenerator = false;
                    this.guideNavButton = "";
                    this.activeQuiz = false;
                    this.generatedPassword = this.passwordUser;
                    this.passwordInputFields[0].value = this.generatedPassword;
                    //this.sendTelemetrics(this.generatedPassword, true, true, this.passwordAutoWord);
                    this.guideCompleted = true;
                    //console.log("Step 8");

                    setTimeout(function () {
                        that.showModal = false;
                    }, 4000); // in milliseconds
                    
                }
            },
            sessionStorageAdd: function() { // Adding the current site to SS
                sessionStorage.setItem("securityAssistantShown", window.location.href);
            },
            sessionStorageCheck: function() { // Checking if current page has been visited before, to prevent showing guide again
                if (sessionStorage.getItem("securityAssistantShown") === window.location.href) {
                    return true;
                }
                else {
                    return false;
                }
            },
            parseDomain: function(url) { // Function for extracting the correct domain name to use as "extra word" for PW generator
                var TLDs = ["ac", "ad", "ae", "aero", "af", "ag", "ai", "al", "am", "an", "ao", "aq", "ar", "arpa", "as", "asia", "at", "au", "aw", 
                "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "biz", "bj", "bm", "bn", "bo", "br", "bs", "bt", "bv", "bw", "by", "bz", 
                "ca", "cat", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "com", "coop", "cr", "cu", "cv", "cx", "cy", "cz", "de", 
                "dj", "dk", "dm", "do", "dz", "ec", "edu", "ee", "eg", "er", "es", "et", "eu", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", 
                "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gov", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", 
                "il", "im", "in", "info", "int", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jobs", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", 
                "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mg", "mh", "mil", "mk", "ml", "mm", "mn", "mo", 
                "mobi", "mp", "mq", "mr", "ms", "mt", "mu", "museum", "mv", "mw", "mx", "my", "mz", "na", "name", "nc", "ne", "net", "nf", "ng", "ni", "nl", "no", "np", 
                "nr", "nu", "nz", "om", "org", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "pro", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", 
                "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "st", "su", "sv", "sy", "sz", "tc", "td", "tel", "tf", "tg", "th", 
                "tj", "tk", "tl", "tm", "tn", "to", "tp", "tr", "travel", "tt", "tv", "tw", "tz", "ua", "ug", "uk", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", 
                "wf", "ws", "xn--0zwm56d", "xn--11b5bs3a9aj6g", "xn--3e0b707e", "xn--45brj9c", "xn--80akhbyknj4f", "xn--90a3ac", "xn--9t4b11yi5a", "xn--clchc0ea0b2g2a9gcd", 
                "xn--deba0ad", "xn--fiqs8s", "xn--fiqz9s", "xn--fpcrj9c3d", "xn--fzc2c9e2c", "xn--g6w251d", "xn--gecrj9c", "xn--h2brj9c", "xn--hgbk6aj7f53bba", 
                "xn--hlcj6aya9esc7a", "xn--j6w193g", "xn--jxalpdlp", "xn--kgbechtv", "xn--kprw13d", "xn--kpry57d", "xn--lgbbat1ad8j", "xn--mgbaam7a8h", "xn--mgbayh7gpa", 
                "xn--mgbbh1a71e", "xn--mgbc0a9azcg", "xn--mgberp4a5d4ar", "xn--o3cw4h", "xn--ogbpf8fl", "xn--p1ai", "xn--pgbs0dh", "xn--s9brj9c", "xn--wgbh1c", "xn--wgbl6a", 
                "xn--xkc2al3hye2a", "xn--xkc2dl3a5ee0h", "xn--yfro4i67o", "xn--ygbi2ammx", "xn--zckzah", "xxx", "ye", "yt", "za", "zm", "zw"].join()

                var parts = url.split('.');
                if (parts[0] === 'www' && parts[1] !== 'com'){
                    parts.shift()
                }
                var ln = parts.length
                , i = ln
                , minLength = parts[parts.length-1].length
                , part

                // iterate backwards
                while(part = parts[--i]){
                    // stop when we find a non-TLD part
                    if (i === 0                    // 'asia.com' (last remaining must be the SLD)
                        || i < ln-2                // TLDs only span 2 levels
                        || part.length < minLength // 'www.cn.com' (valid TLD as second-level domain)
                        || TLDs.indexOf(part) < 0  // officialy not a TLD
                    ){
                        return part
                    }
                }
            },
            sendTelemetrics: function(password, sawModal, didGuide, passwordAutoWord) { // Running password check and sending telemetrics to API
                //console.log("Sending data to NSA, please standby..." + password);
                this.checkPass(password, sawModal, didGuide, passwordAutoWord);
            },
            strengthCalculator: function() {

            }
        },
        computed: {
            calculateWords: function() {
                
                // if(this.passwordUser.length !== 0)
                // {
                //     var arr = this.passwordUser.match(/\S+/g);
                //     var newstr = arr.join("")

                //     //this.generatedPassword = newstr + this.passwordAutoWord;
                //     this.generatedPassword = newstr;
                //     return arr.length;
                // }
                // else
                // {
                //     return 0;
                // }
            },
            pwStrengthValue: function() {
                    this.pwStrengthValueDropbox = zxcvbn(this.passwordUser, user_inputs=[]);
                    
                    if (this.pwStrengthValueDropbox.score === 0)
                    {
                        this.pwStrengthText = "Very weak password";
                        this.pwStrengthColor = "#f96868";
                        return 5;
                    }
                    else if (this.pwStrengthValueDropbox.score === 1)
                    {
                        this.pwStrengthText = "Weak password";
                        this.pwStrengthColor = "#f96868";
                        return 15;
                    }
                    else if (this.pwStrengthValueDropbox.score === 2)
                    {
                        this.pwStrengthText = "Average password";
                        this.pwStrengthColor = "#178de5";
                        return 35;
                    }
                    else if (this.pwStrengthValueDropbox.score === 3)
                    {
                        this.pwStrengthText = "Stronger password";
                        this.pwStrengthColor = "#178de5";
                        return 65;
                    }
                    else if (this.pwStrengthValueDropbox.score === 4)
                    {
                        
                        this.pwStrengthText = "Very strong password";
                        this.pwStrengthColor = "#1abc9c";
                        return 100;
                    }
            }
        },
        mounted: function () { // Run on page load to initiate everything
            var that = this;
            
            this.findAllPasswordInputFields(function(){
                that.addListenersToPasswordInputFields();
            });
        }
    });
}

initDependencies();