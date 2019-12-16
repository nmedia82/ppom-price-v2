// import $ from "jquery";
//NMedia Helper
const nmh = {
  show_console: true,
  working_dom: 'loading-data',
  l: function(a, b) {
    this.show_console && console.log(a, b);
  },
  strip_slashes: function(s) {
    return s.replace(/\\/g, '');
  },
  working: function(m) {
    $("#"+this.working_dom).html(m);
  }
}


const getData = {
  //url: 'https://api.myjson.com/bins/ji4cg',
  url: 'https://api.myjson.com/bins/160su4',
  data: [],
  load: function() {
    nmh.working("Loading data ...");
    const self = this;
    $.ajax({
      type: 'GET',
      url: self.url,
      async: false,
      contentType: "application/json",
      dataType: 'json',
      success: function(data) {
        //alert('success');
        nmh.l(data);
        nmh.working("Data loading completed");
        self.data = data;
      },
      error: function(e) {
        //alert('error');
        nmh.l(e);

      }
    });
  },
}

// DOM Manipulation
const ppom_input = {
  dom: {},
  init: function(dom) {
    this.dom = dom;
    return this;
  },

  // Methods
  dataname: function() {
    return $(this.dom).attr('data-data_name');
  },
  type: function() {
    return this.dom.type;
  },
  value: function() {
    let v = $(this.dom).val();
    if (this.type() === 'checkbox' || this.type() === 'radio') {
      v = $(this.dom).is(':checked') ? v : '';
    }
    return v;
  },
}

// Build OptionPrice Class
class PPOM_Price_Class {

  constructor(field, value) {
    this.field = field;

    //parse for image/audio input
    this.value = this.get_value(value);
    

    // Object Destructruing
    const {
        type:ppom_type,
        title:price_label,
        data_name,
      } = this.field;

      this.dataname = data_name;
      this.type     = ppom_type;
      this.label    = price_label;
      this.options  = this.get_options();
      this.id       = this.get_id();
      this.price    = this.get_price();
      this.apply    = this.get_apply();
      this.quantity = this.get_quantity();
      this.has_percent = this.get_has_percent();
      this.is_positive = this.price > 0 ? true : false;
  }

  // Getter Methods
  get_id() {
    const {type,data_name,options,images} = this.field;
    
    let id = data_name;

      const priced = this.options.find(o => o.price !== 0 && nmh.strip_slashes(o.title) === this.value);
      if( priced ) {
        id = data_name+'_'+priced.id;   
      }
    return id;
  }

  get_price() {
    let p = this.field.price || '';
    // if options found    
    if( this.options ){
      // const option_title = o.option || o.title;
      const priced = this.options.find(o => o.price !== '' && nmh.strip_slashes(o.title) === this.value);
      if( priced ) {
        p = priced.price;
      } 
    }

    return Number(p);
  }

  get_apply() {
    const {type,onetime} = this.field;
    return onetime == 'on' ? 'fixed' : 'variable';
  }

  get_quantity() {
    return 1;
  }

  get_value(value) {

    const {type} = this.field;
    switch(type){
      case 'image':
      case 'audio':
        value = JSON.parse(value);
        value = value.title;
      break;
    }

    // console.log('JSON Value', value);
    return value;
  }

  get_options() {
    const {type,options,images,audio} = this.field;
    let field_options = options || images || audio || [];
    if( field_options ) {
        field_options.map(fo => fo.title = fo.option || fo.title);

    }

    // console.log("Options", field_options);
    return field_options;
  }
  get_has_percent() {
    return 1;
  }
}


/* getData.load(); */
const ppomPrice = {
  meta: [],
  field_prices: [],
  input: {},
  ppom_type: '',	//ppom input type
  init: function(input_dom) {
  	
    let list = document.querySelectorAll(".ppom-input");
    this.field_prices = [];
    //let items = Array.from(list).map(elem => {
    
    $.each(list, (index, elem) => {
        
    // binding events
    input = ppom_input.init(elem);
    // console.log('DOM Input', input);
    this.set_ppom_type(input.dataname());
    //this.input = $(e.currentTarget);
    /*nmh.l('Dom Type', input.type());
    nmh.l('PPOM Type', this.ppom_type);
    nmh.l('Value', input.value());
    nmh.l('Dataname', input.dataname());*/

    const has_value = input.value() || false;
    const field_meta = this.meta.find(m => m.data_name === input.dataname());
    if( has_value && field_meta ) {
      console.log('FieldMeta', field_meta);
      this.update_price(field_meta, input.value());
    }


    // if (has_value && (this.has_price(input.dataname(), input.value())) ) {
    //   nmh.working('Found price '+this.ppom_price);
    // } else {
    //   //this.update_price(null, input.dataname());
    // }
    
    });
    
  },
  
  load_data: function() {
  	getData.load();
    this.meta = getData.data;
    nmh.l(this.meta);
  },

  has_price: function(data_name, value) {
    let found = false;
    let ppom_price = {};
    // filter meta by datname
    const filter = this.meta.filter(m => m.data_name === data_name);

    $.each(filter, (index, field) => {
    // filter.map(field => {
    // console.log('Field filter', field);
    
    	// const ppom_price = ppom_option_price.init(field, value);
      
      // console.log(ppom_price);
      this.update_price(field, value);

    });
    return found;
  },
  
  // Get ppom input type from meta by datame
  set_ppom_type: function(dataname){
  	const filter = this.meta.find(m => m.data_name === dataname);
    this.ppom_type = filter.type || 'unknown';
  },
  
  update_price: function(field, value){
  	
    const ppom_price = new PPOM_Price_Class(field, value);
    // console.log('Prices Found ', ppom_price);
    // filter only those option which have prices
    let field_prices = this.field_prices.filter(f => f.id !== ppom_price.id);    
    // If price found
    if( ppom_price && ppom_price.price != 0)
    	field_prices = [...field_prices, ppom_price];
    //console.log(ppom_price);
    this.field_prices = field_prices;
    console.log("Field Price", this.field_prices);
  },
 	render_table: function(){
  	
    if( this.field_prices.length === 0 ) return;
    
  }

}


// INITs
ppomPrice.load_data();
$(".ppom-input").on('change keyup', function(e){
	ppomPrice.init(e.currentTarget);
  // console.log('field_prices', ppomPrice.field_prices);
});