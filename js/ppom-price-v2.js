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
    let type = this.dom.type;
    //type = $(this.dom).attr('data-type') ? $(this.dom).attr('data-type') : type;
    return type;
  },
  value: function() {
    let v = $(this.dom).val();
    if (this.type() === 'checkbox' || this.type() === 'radio') {
      v = $(this.dom).is(':checked') ? v : '';
    }
    return v;
  },
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

    filter.map(m => {
    
    	this.price = '';
      // Destructuring
      const {
        type,
        title:price_label,
        price,
        options,
        images,
        onetime,
        onetime_taxable
      } = m;
      switch (this.ppom_type) {
      	case 'email':
        case 'number':
        case 'text':
        
          if (price) {
          	found = true;
            //console.log('text/number/email', priced);
            const option_id = data_name;
            ppom_price.id = option_id;
            ppom_price.price = price;
            ppom_price.dataname = data_name;
            ppom_price.type = type;
            ppom_price.apply = onetime == 'on' ? 'fixed' : 'variable';
            ppom_price.label = price_label;
            ppom_price.value = value;
            ppom_price.quantity = 1;  
            this.update_price(ppom_price);
            
            }
          break;
        case 'select':
        case 'checkbox':
        case 'radio':
          const priced = options.find(o => o.price !== '' && nmh.strip_slashes(o.option) === value);
          
          //console.log('select/radio/checkbox', priced);
          if (priced) {
          	found = true;
            
            const option_id = data_name+"_"+priced.id;
            ppom_price.id = option_id;
            ppom_price.dataname = data_name;
            ppom_price.type = type;
            ppom_price.price = priced.price;
            ppom_price.apply = onetime == 'on' ? 'fixed' : 'variable';
            ppom_price.label = price_label;
            ppom_price.value = value;
            ppom_price.quantity = 1;            
                        
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
              found = true;
              const option_id = data_name+"_"+image_found.id;
              ppom_price.id = option_id;
              ppom_price.dataname = data_name;
              ppom_price.type = type;
              ppom_price.price = image_found.price;
              ppom_price.apply = onetime == 'on' ? 'fixed' : 'variable';
              ppom_price.label = price_label;
              ppom_price.value = value;
              ppom_price.quantity = 1;
              
              this.update_price(ppom_price);
            }
            return 
         break;
         
      }

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

ppomPrice.load_data();
$(".ppom-input").on('change keyup', function(e){
	ppomPrice.init(e.currentTarget);
  console.log('field_prices', ppomPrice.field_prices);
});