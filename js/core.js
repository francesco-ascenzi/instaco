/* __VARIABLES */

/* Lists */
let followers = document.querySelector('#followers');
let following = document.querySelector('#following');
let subButton = document.querySelector('#sub_but');

/* Errors */
let errors = document.querySelector('#err_tex');

/* Results */
let resContainer = document.querySelector('.res_con');
let resFollowers = document.querySelector('#res_fos');
let resFollowing = document.querySelector('#res_fog');

/* __CLASSES */

/* Check for emptyness and errors */
class checkClass {
    constructor(list, type) {
        this.list = list;
        this.type = type;
    }

    checkErrors() {
        if (typeof this.list === 'string') {
            if (this.list.indexOf(',') > -1) {
                return this.list.split(',');
            } else if (this.list.indexOf(' ') > -1) {
                return this.list.split(' ');
            } else {
                errors.innerText = this.type.toUpperCase() + ' list contains invalid dividers, use whitespaces ( ) and commas (,)';
                eval(this.type).style = 'border: 1px solid #ff0000;';
                errors.style = 'display: block; color: #ff0000;';
                return 0;
            }
        } else {
            errors.innerText = this.type.toUpperCase() + ' list is empty or invalid';
            eval(this.type).style = 'border: 1px solid #ff0000;';
            errors.style = 'display: block; color: #ff0000;';
            return 0;
        }
    }
}

/* __LISTENERS */

/* Form */
subButton.addEventListener('click', function() {

    /* Empty followers and following lists */
    resFollowers.innerHTML = resFollowing.innerHTML = '';

    /* Followers list */
    let checkFos = new checkClass(followers.value, 'followers');
    let followersList = checkFos.checkErrors();

    if (typeof followersList === 'number' && followersList == 0) {
        return;
    }

    /* Following list */
    let checkFog = new checkClass(following.value, 'following');
    let followingList = checkFog.checkErrors();

    if (typeof followingList === 'number' && followingList == 0) {
        return;
    }

    /* Show results */
    errors.style = 'display: none;';
    resContainer.style = 'display: block;';

    /* Functions to filter for finding equal elements */
    let findFollowers = followingList.filter(e => !followersList.find(a => e == a));
    let findFollowing = followersList.filter(e => !followingList.find(a => e == a));

    for (let i = 0; i < findFollowers.length; i++) {
        resFollowers.innerHTML += '<li><a href="https://www.instagram.com/"' + findFollowers[i] + ' aria-label="Press to visit ' + findFollowers[i] + ' profile">' + findFollowers[i] + '</a></li>';
    }

    for (let i = 0; i < findFollowing.length; i++) {
        resFollowing.innerHTML += '<li><a href="https://www.instagram.com/"' + findFollowing[i] + ' aria-label="Press to visit ' + findFollowing[i] + ' profile">' + findFollowing[i] + '</a></li>';
    }

});