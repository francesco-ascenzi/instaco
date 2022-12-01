/* __VARIABLES */

/* Lists */
let followers = document.querySelector('#followers');
let following = document.querySelector('#following');
let checkButton = document.querySelector('#check-button');

/* Errors */
let errorList = document.querySelector('#error-list');

/* Results */
let resultsList = document.querySelector('#results');
let followersRes = document.querySelector('#followers-list');
let followingRes = document.querySelector('#following-list');

/* FUNCTIONS | Check if inputs are empty */
class checkClass {
    constructor(list) {
        this.list = list;
        this.resList = [];
    }
    checkDividers() {
        if (this.list.indexOf(' ') > -1) {
            this.resList.join(' ');
        } else if (this.list.indexOf(',') > -1) {
            this.resList.join(',');
        } else {
            return 0;
        }
        return resList;
    }
}

/* LISTENER | Form */
checkButton.addEventListener('click',function() {

    /* Empty followers and following lists */
    followersRes.innerHTML = followingRes.innerHTML = '';

    /*  */
    let followersClass = new checkClass(followersList);
    let followingClass = new checkClass(followingList);
    followersRes = followersClass.checkDividers();
    followingRes = followingClass.checkDividers();

    console.log(followersRes);

    /* Filtering following list for every element if it can't find element that is element equal to element 
            rsfer=flwingl.filter(e => !flwerl.find(a => e == a));
            rsfol=flwerl.filter(e => !flwingl.find(a => e == a));
            rsc.style.display='block';
            /* Start loops
            doArr(rsfol,rsin);
            doArr(rsfer,rser);
        } else {
            fme.style='display: block;';
            fme.innerText='Followers or following list are not compatible. It should be only whitespaces ( ) between followers or following name';
        };
    } else {
        fme.style='display: block;';
        fme.innerText='Followers or following lists are empty';
    };
    */
});

/* Array process 
function doArr(x,y) {
    var nChk=50;
    var i=0;
    function doBlks() {
        var chk=nChk;
        while (chk--&&i<x.length) {
            y.innerHTML+='<li><a href="https://www.instagram.com/'+x[i]+'" target="_blank" aria-label="'+x[i]+' Instagram profile">'+x[i]+'</a></li>'
            i++;
        };
        if (i<x.length) {
            setTimeout(doBlks,200);
        };
    };
    doBlks();
}; */