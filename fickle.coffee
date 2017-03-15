###
# FICKLE: A statebus library for responsive variables
# The MIT License (MIT)
# Copyright (c) Travis Kriplean, Invisible College
#  
# 
# Define & recompute shared variables based upon viewport changes, such as a 
# resize of a window. 
# 
# To use, add RESPONSIVE() to a component, such as dom.BODY.
# 
# If you want to have more than just window_width and window_height defined, 
# define a function that calculates the custom responsive variables. 
# This function takes a single argument, the upstream variables like window 
# width and height that have already been calculated. For example: 
# 
# RESPONSIVE
#   calc: (upstream_vars) -> 
#     single_col: upstream_vars.window_width < 500
#     gutter: if upstream_vars.window_width > 1000 then 80 else 10
#
# Any of your components can register their own RESPONSIVE variables using the 
# same method. 
# 
# All variables are made available on fickle. E.g. fickle.window_width. 
# Any component that has accessed a responsive variable on fickle will 
# be re-rendered if the variable changes. For example: 
# 
# DIV 
#   style: 
#     width: if fickle.single_col then fickle.window_width else fickle.window_width / 2
#     padding: fickle.gutter
# 
# Beneath the surface, all variables are at fetch("fickle_vars"), and a getter 
# is used to facilitate the direct variable access while subscribing callers 
# to changes. 
###

dom.RESPONSIVE = -> 
  if !@initialized?
    registered_funks.push @props.calc 
    @initialized = true
    be_responsive()

  SPAN null

dom.RESPONSIVE.down = -> 
  idx = registered_funks.indexOf(@props.funk)
  if idx > -1
    registered_funks.splice idx, 1
  else 
    console.error 'Could not clean up FICKLE funk'

be_responsive = -> 
  vars = fetch('fickle_vars')

  base_vars = 
    window_width: window.innerWidth
    window_height: window.innerHeight
    document_width: document.body.clientWidth
    document_height: document.body.clientHeight

  # Compute the custom variables that the programmer wants defined
  responsive_vars = {}
  for funk in registered_funks
    extend responsive_vars, funk(base_vars)

  responsive_vars = extend responsive_vars, base_vars 

  # only update if we have a change
  changed = false
  for own k,v of responsive_vars
    if vars[k] != v
      changed = true
      vars[k] = v

  # Convenience method for programmers to access variables.
  for lvar in Object.keys(vars)
    if !prop_defined[lvar]
      do (lvar) ->
        prop_defined[lvar] = true
        Object.defineProperty fickle, lvar,
          get: -> 
            fetch('fickle_vars')[lvar]

  save(vars) if changed
  vars

window.fickle = {}
registered_funks = []
prop_defined = {}

# Trigger recomputation of variables on appropriate events. 
# Currently only responding to window resize events. 
for ev in ['resize']
  window.addEventListener ev, be_responsive

