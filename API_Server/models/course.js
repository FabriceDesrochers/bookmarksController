module.exports = 
class Course{
    constructor(title, code)
    {
        this.Id = 0;
        this.Title = undefined ? title : "";
        this.Code = undefined ? code : "";
    }
}