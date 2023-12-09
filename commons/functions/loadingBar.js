/** Print dynamic loading bar
 * 
 * @param {Number} percentageNumber Percentage number
 * 
 * @return {Void}
 */
function loadingBar(percentageNumber) {
  const progressBarLength = 30;
  const completedPercentage = (percentageNumber >= 100 ? 100 : percentageNumber).toFixed(2);
  const completedLength = Math.round((percentageNumber / 100) * progressBarLength);

  const progressBar = "█".repeat(completedLength) + "░".repeat(progressBarLength - completedLength);

  console.clear();
  console.log(`INSTACO - The free followers/followings scraper\n`);
  console.log(`Instruction:`);
  console.log(`- Create a folder inside this project and rename it "data"`);
  console.log(`- Put followers and following files in json format into it\n`);
  console.log('Check that followers file contain "followers" string in its name and following file "following" string too\n');
  if (percentageNumber > 99) {
    console.log(`${progressBar} ${completedPercentage}%\n`);
    console.timeEnd("Loading complete in");
  } else {
    console.log(`${progressBar} ${completedPercentage}%`);
  }
}

module.exports = loadingBar;