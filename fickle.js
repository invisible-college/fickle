/*
 * FICKLE: A statebus library for responsive variables
 * The MIT License (MIT)
 * Copyright (c) Travis Kriplean, Invisible College
 *  
 * 
 * Define & recompute shared variables based upon viewport changes, such as a 
 * resize of a window. 
 * 
 * To use, add RESPONSIVE() to a component, such as dom.BODY.
 * 
 * If you want to have more than just window_width and window_height defined, 
 * define a function that calculates the custom responsive variables. 
 * This function takes a single argument, the upstream variables like window 
 * width and height that have already been calculated. For example: 
 * 
 * RESPONSIVE
 *   calc: (upstream_vars) -> 
 *     single_col: upstream_vars.window_width < 500
 *     gutter: if upstream_vars.window_width > 1000 then 80 else 10
 * 
 * Any of your components can register their own RESPONSIVE variables using the 
 * same method. 
 * 
 * All variables are made available on fickle. E.g. fickle.window_width. 
 * Any component that has accessed a responsive variable on fickle will 
 * be re-rendered if the variable changes. For example: 
 * 
 * DIV 
 *   style: 
 *     width: fickle.single_col
 *     padding: fickle.gutter
 * 
 * Beneath the surface, all variables are at fetch("fickle_vars"), and a getter 
 * is used to facilitate the direct variable access while subscribing callers 
 * to changes.
 */
var be_responsive, ev, i, len, prop_defined, ref, registered_funks,
  hasProp = {}.hasOwnProperty;

dom.RESPONSIVE = function() {
  if (this.initialized == null) {
    registered_funks.push(this.props.calc);
    this.initialized = true;
    be_responsive();
  }
  return SPAN(null);
};

dom.RESPONSIVE.down = function() {
  var idx;
  idx = registered_funks.indexOf(this.props.funk);
  if (idx > -1) {
    return registered_funks.splice(idx, 1);
  } else {
    return console.error('Could not clean up FICKLE funk');
  }
};

be_responsive = function() {
  var base_vars, changed, funk, i, j, k, len, len1, lvar, ref, responsive_vars, v, vars;
  vars = fetch('fickle_vars');
  base_vars = {
    window_width: window.innerWidth,
    window_height: window.innerHeight,
    document_width: document.body.clientWidth,
    document_height: document.body.clientHeight
  };
  responsive_vars = {};
  for (i = 0, len = registered_funks.length; i < len; i++) {
    funk = registered_funks[i];
    extend(responsive_vars, funk(base_vars));
  }
  responsive_vars = extend(responsive_vars, base_vars);
  changed = false;
  for (k in responsive_vars) {
    if (!hasProp.call(responsive_vars, k)) continue;
    v = responsive_vars[k];
    if (vars[k] !== v) {
      changed = true;
      vars[k] = v;
    }
  }
  ref = Object.keys(vars);
  for (j = 0, len1 = ref.length; j < len1; j++) {
    lvar = ref[j];
    if (!prop_defined[lvar]) {
      (function(lvar) {
        prop_defined[lvar] = true;
        return Object.defineProperty(fickle, lvar, {
          get: function() {
            return fetch('fickle_vars')[lvar];
          }
        });
      })(lvar);
    }
  }
  if (changed) {
    save(vars);
  }
  return vars;
};

window.fickle = {};

registered_funks = [];

prop_defined = {};

ref = ['resize'];
for (i = 0, len = ref.length; i < len; i++) {
  ev = ref[i];
  window.addEventListener(ev, be_responsive);
}
