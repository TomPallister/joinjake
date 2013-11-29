var PlaceReview = function(model){
    var self = this;
    self.Rating = ko.observable();
    self.Text = ko.observable();
    self.Time = ko.observable();
    self.Author = ko.observable();

    self.PopulateModel = function(data){
        console.log(data.aspects[0].rating)
        self.Rating(data.aspects[0].rating)
        self.Text(data.text)
        self.Time(data.time)
        self.Author(data.author_name)
    };

    if(model){
        self.PopulateModel(model)
    }
};
