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

// Build OptionPrice Object
const ppom_option_price = {

  field: {},

  init: function(field, value) {

    this.field = field;
    // console.log(this.field);
    // Object Destructruing
    const {
        ppom_type,
        title:price_label,
        price,
        options,
        images,
        onetime,
        onetime_taxable,
        data_name,
      } = this.field;


      this.dataname = data_name;
      this.type     = ppom_type;
      this.label    = price_label;
      this.value    = value;
      this.id       = this.get_id();
      this.price    = this.get_price();
      this.apply    = this.get_apply();
      this.quantity = this.get_quantity();

      /*switch (ppom_type) {
        case 'email':
        case 'number':
        case 'text':
          if (price) {
            console.log('text/number/email', priced);
            
            this.price = price;
            
            
            }
        break;
        case 'select':
        case 'checkbox':
        case 'radio':
          const priced = options.find(o => o.price !== '' && nmh.strip_slashes(o.option) === value);
          
          //console.log('select/radio/checkbox', priced);
          if (priced) {
            const option_id = data_name+"_"+priced.id;
            this.id = option_id;
            this.dataname = data_name;
            this.type = type;
            this.price = priced.price;
            this.apply = onetime == 'on' ? 'fixed' : 'variable';
            this.label = price_label;
            this.value = value;
            this.quantity = 1;            
                        
            this.update_price(ppom_price);
          }
          break;
          
         case 'image':
            //Destructuring
            const value_json = JSON.parse(value);
            const {link,id,title,price:image_price} = value_json;
            const image_found = images.find(i => i.price && i.id === id);
            //console.log('image',image_found);
            if (image_found) {
              const option_id = data_name+"_"+image_found.id;
              this.id = option_id;
              this.dataname = data_name;
              this.type = type;
              this.price = image_found.price;
              this.apply = onetime == 'on' ? 'fixed' : 'variable';
              this.label = price_label;
              this.value = value;
              this.quantity = 1;
            }
            return 
         break;         
      }*/

      console.log(this);
      return this;
  },

  // Getter Methods
  get_id: function() {
    const {type,data_name,options,images} = this.field;
    
    let id = data_name;

    switch(type){
      case 'select':
      case 'radio':
      case 'checkbox':
        return data_name;
      break;
    }
  },

  get_price: function() {
    const {type,price} = this.field;
    let p = price;
    
    switch(type){
      case 'select':
      case 'radio':
      case 'checkbox':
        p = price;
      break;
    }

    return p;
  },
  get_apply: function() {
    const {type,onetime} = this.field;
    return onetime == 'on' ? 'fixed' : 'variable';
  },
  get_quantity: function() {
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
    //console.log(input);
    this.get_ppom_type(input.dataname());
    //this.input = $(e.currentTarget);
    /*nmh.l('Dom Type', input.type());
    nmh.l('PPOM Type', this.ppom_type);
    nmh.l('Value', input.value());
    nmh.l('Dataname', input.dataname());*/
    
    const has_value = input.value() || false;

    if (has_value && (this.has_price(input.dataname(), input.value())) ) {
      nmh.working('Found price '+this.ppom_price);
    } else {
      //this.update_price(null, input.dataname());
    }
    
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

    filter.map(field => {
    
    	const ppom_price = ppom_option_price.init(field);      

    });
    return found;
  },
  
  // Get ppom input type from meta by datame
  get_ppom_type: function(dataname){
  	const filter = this.meta.find(m => m.data_name === dataname);
    this.ppom_type = filter.type || 'unknown';
  },
  
  update_price: function(ppom_price){
  	
    console.log('Prices Found ', ppom_price);
    // some price validatation and flags
    ppom_price.has_percent = false;
    if( ppom_price.price.includes('%') ) {
    	ppom_price.price = ppom_price.price;
      ppom_price.has_percent = true;
    } else {
    	ppom_price.price = Number(ppom_price.price);
    }
    
    
    let field_prices = this.field_prices.filter(f => f.id !== ppom_price.id);
    
    // If price found
    if( ppom_price )
    	field_prices = [...field_prices, ppom_price];
    //console.log(ppom_price);
    this.field_prices = field_prices;
    //console.log(this.field_prices);
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