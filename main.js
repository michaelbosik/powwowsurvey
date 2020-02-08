var answers = [];
var currentTab = 0; // Current tab is set to be the first tab (0)
var players = [];

function next(q, a, o) {
    console.log(answers);
    answers.push({
        q: q,
        a: a,
        o: o
    });
}

function submit(data) {
    console.log(data);
    console.log(answers);
    $.ajax({
        type: "POST",
        url: '/submit',
        data: {
            ans: JSON.stringify(answers)
        }
    });
}

function generateQuestions() {

    var form = document.getElementById('regForm');

    form.innerHTML += '<h1>Pick the sound that best matches the art</h1>';

    $.ajax({
        type: "GET",
        url: '/input',
        data: {},
        success: function(data) {
            data = JSON.parse(data);

            let i = 0;

            for (i; i < data.length; i++) { //iterate through questions array
                let qid = data[i].img.substring(data[i].img.indexOf('d/') + 2, data[i].img.indexOf('/preview'));
                //add image from data
                form.innerHTML += '<div class="tab"><div class="imgwrp"><iframe style="width:100%;height:400px;" src="' +
                    data[i].img + '"></iframe></div><br><div id="' + qid + '" class="inputcontainer">';

                let q = document.getElementById(qid);
                let ct = 0;
                for (let j = 0; j < data[i].sounds.length; j++) { //iterate through current question's sounds array

                    let sid = data[i].sounds[j].substring(data[i].sounds[j].indexOf('=') + 1);

                    q.innerHTML += '<div class="selection"><input type="radio" name="' + qid + '" value="' + (ct++) + '">' +
                        '<div class="play youtube-audio" data-video="' + sid + '" data-autoplay="0" data-loop="0"></div></div><br>'

                }
                form.innerHTML += '</div></div>';
            }

            form.innerHTML += '<div style="overflow:auto;"><div style="float:right;">' +
                '<button type="button" id="prevBtn" onclick="nextPrev(-1)">Previous</button>' +
                '<button type="button" id="nextBtn" onclick="nextPrev(1)">Next</button>' +
                '</div></div>' +
                '<div id="steps" style="text-align:center;margin-top:40px;">';
            var steps = document.getElementById('steps');
            for (let k = 0; k < i; k++) {
                steps.innerHTML += '<span class="step"></span>';
            }

            form.innerHTML += '</div>';

            showTab(currentTab); // Display the current tab
            document.getElementById('head').innerHTML += '<script src="https://www.youtube.com/iframe_api"></script>';
            var tag = document.createElement('script');

            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    })
}

function showTab(n) {
    // This function will display the specified tab of the form...
    var x = document.getElementsByClassName("tab");
    console.log(x);
    x[n].style.display = "block";
    //... and fix the Previous/Next buttons:
    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
    } else {
        document.getElementById("prevBtn").style.display = "inline";
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } else {
        document.getElementById("nextBtn").innerHTML = "Next";
    }
    //... and run a function that will display the correct step indicator:
    fixStepIndicator(n)
}

function nextPrev(n) {
    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");
    // Exit the function if any field in the current tab is invalid:
    if (n == 1 && !validateForm()) return false;
    // Hide the current tab:
    x[currentTab].style.display = "none";
    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    // if you have reached the end of the form...
    if (currentTab >= x.length) {
        // ... the form gets submitted:
        document.getElementById("regForm").submit();
        return false;
    }
    // Otherwise, display the correct tab:
    showTab(currentTab);
}

function validateForm() {
    // This function deals with validation of the form fields
    var x, y, i, valid = true;
    x = document.getElementsByClassName("tab");
    y = x[currentTab].getElementsByTagName("input");
    // A loop that checks every input field in the current tab:
    for (i = 0; i < y.length; i++) {
        // If a field is empty...
        if (y[i].value == "") {
            // add an "invalid" class to the field:
            y[i].className += " invalid";
            // and set the current valid status to false
            valid = false;
        }
    }
    // If the valid status is true, mark the step as finished and valid:
    if (valid) {
        console.log(document.getElementsByClassName("step")[currentTab]);
        document.getElementsByClassName("step")[currentTab].className += " finish";
    }
    return valid; // return the valid status
}

function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    var i, x = document.getElementsByClassName("step");
    console.log("i" + i);
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    //... and adds the "active" class on the current step:
    console.log(x);
    x[n].className += " active";
}


function togglePlayButton(play, id) {
    document.getElementById("youtube-icon" + id).src = play ? "https://i.imgur.com/IDzX9gL.png" : "https://i.imgur.com/quyUPXN.png";
}

function toggleAudio(event) {
    let id = event.target.id.substring(12);
    let player = players.find(player => player.id === id).player;
    if (player.getPlayerState() == 1 || player.getPlayerState() == 3) {
        player.pauseVideo();
        togglePlayButton(false, id);
    } else {
        player.playVideo();
        togglePlayButton(true, id);
    }
}

function onPlayerReady(event) {
    let id = event.target.i.id.substring(14);
    players.find(player => player.id === id).player.setPlaybackQuality("small");
    togglePlayButton(players.find(player => player.id === id).player.getPlayerState() !== 5, id);
}

function onPlayerStateChange(event) {
    let id = event.target.i.id.substring(14);
    if (event.data === 0) {
        togglePlayButton(false, id);
    }
}