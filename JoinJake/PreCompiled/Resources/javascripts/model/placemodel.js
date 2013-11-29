var PlaceModel = function(model){
    var self = this;
    self.Website = ko.observable();
    self.GooglePlusUrl = ko.observable();
    self.Name = ko.observable();
    self.Address = ko.observable();
    self.Number = ko.observable();
    self.Sunday = ko.observable();
    self.Monday = ko.observable();
    self.Tuesday = ko.observable();
    self.Wednesday = ko.observable();
    self.Thursday = ko.observable();
    self.Friday = ko.observable();
    self.Saturday = ko.observable();
    self.Reviews = ko.observableArray();

    self.PopulateModel = function(data){

        if (data.website != undefined) {
            self.Website("Click <a href=\"" + data.website + "\" target=\"_blank\">here</a> to check out this places website");
        }
        self.GooglePlusUrl(data.url);
        self.Name(data.name);
        self.Address(data.formatted_address);
        self.Number(data.formatted_phone_number);
};

    if(model){
        self.PopulateModel(model)
    }
};
