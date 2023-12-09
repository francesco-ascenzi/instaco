/** Generate a date file name
 * 
 * @returns date file name
 */
function GenerateFileName() {
    const date = new Date();

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().padStart(2, '0');

    return `${year}${month}${day}`;
}

module.exports = GenerateFileName;