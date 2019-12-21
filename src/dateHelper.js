
String.prototype.ToDate = function() {
    const stringValue =  this;//02-05-2017
    const day = stringValue.substr(0,2);
    const month = parseInt(stringValue.substr(3,2))-1;
    const year = stringValue.substr(6,4);

    return new Date(year,month,day);

};//
String.prototype.AsDatePicker = function() {
    const stringValue =  this;//22-05-2017
    const day = stringValue.substr(0,2);
    const month = stringValue.substr(3,2);
    const year = stringValue.substr(6,4);

    return year+"-"+month+'-'+day;

};

String.prototype.AsTimePicker = function() {
    const stringValue =  this;//20:00
    const hours = stringValue.substr(0,2);
    const minutes = stringValue.substr(3,2);

    return hours+":"+minutes;

};

String.prototype.FromDatePickerToString = function() {
    const dateTimePickerStringValue =  this;//2017-03-12
    const year = dateTimePickerStringValue.substr(0,4);
    const month = dateTimePickerStringValue.substr(5,2);
    const day = dateTimePickerStringValue.substr(8,2);

    return day+"-"+month+'-'+year;


};
String.prototype.FromDatePickerToDate = function(hour = 0,minutes = 0) {
    const dateTimePickerStringValue =  this;//2017-03-12
    const year = parseInt(dateTimePickerStringValue.substr(0,4));
    const month = parseInt(dateTimePickerStringValue.substr(5,2))-1;
    const day = parseInt(dateTimePickerStringValue.substr(8,2));
    return new Date(year,month,day,hour,minutes,0,0);
};


Date.prototype.AsString = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
    return  (dd>9 ? '' : '0') + dd +'-'+ (mm>9 ? '' : '0') + mm+'-'+this.getFullYear();

};
Date.prototype.AsTimePicker = function() {
    var hh = this.getHours();
    var mm = this.getMinutes();
    //console.log('AsTimePicker hh:mm  '+hh+':'+mm);
    const res =  (hh>9 ? '' : '0') + hh +':'+ (mm>9 ? '' : '0') + mm;
   // console.log('AsTimePicker res:  '+res);
    return res;

};
Date.prototype.addHours = function(h) {    
    const newDate = this.setTime(this.getTime() + (h*60*60*1000)); 
    return newDate;   
 }

function getDate(stringDate){
  //stringDate:02-05-2017
  if (!stringDate || stringDate.trim().length!=10){
    return new Date();
  }
  const day = parseInt(stringDate.substr(0,2));
  const month = parseInt(stringDate.substr(3,2)) -1;
  const year = parseInt(stringDate.substr(6,4));
  const res = new Date(year,month,day);

  return res;
}

function CompareGamesByDate(gameA,gameB){
  const dateA = getDate(gameA.name);
  const dateB = getDate(gameB.name);
  return dateA > dateB ? 1 : -1;
}


export default CompareGamesByDate;
