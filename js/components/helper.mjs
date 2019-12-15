export const nmh = {
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