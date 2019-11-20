<?php

/**
 * @package WPMapBox
 *
**/
/*
Plugin Name: WordPress MapBox
Plugin URI: https://www.burtonmediainc.com/plugins/wp-mapbox
Description: A plugin created to add a mapbox shortcode to your WordPress website.
Version: 1.0.0
Author: Jesse James Burton
Author URI: https://www.burtonmediainc.com
License: GPLv2 or Later
Text Domain: wp-mapbox
GIT: https://github.com/jessejburton/wp-mapbox.git
*/

/* Include Styles */
function add_mapbox_plugin_styles() {
  wp_enqueue_style( 'wp-mapbox-styles', 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.5.0/mapbox-gl.css', array(), '1.1', 'all');
  wp_enqueue_style( 'wp-mapbox-local-styles', plugins_url('wp-mapbox.css',__FILE__ ), array(), '1.1', 'all');
}
add_action( 'wp_enqueue_scripts', 'add_mapbox_plugin_styles' );

/* Include Scripts */
function add_mapbox_plugin_script() {
  wp_enqueue_script( 'wp-mapbox-scripts', 'https://api.tiles.mapbox.com/mapbox-gl-js/v1.5.0/mapbox-gl.js', array(), '1.1', 'all', false);
  wp_enqueue_script( 'wp-mapbox-local-script', plugins_url('wp-mapbox.js',__FILE__ ), array(), '1.1', 'all', false);
}
add_action( 'wp_enqueue_scripts', 'add_mapbox_plugin_script' );

function add_wp_mapbox_shortcodes() {
  add_shortcode( 'wp-mapbox', 'wp_mapbox_shortcode' );
}
add_action( 'init', 'add_wp_mapbox_shortcodes' );

function wp_mapbox_shortcode( $atts ) {
  global $wp_query,
         $post;

  $atts = shortcode_atts( array(
    'max_posts' => 30
  ), $atts );

  $loop = new WP_Query( array(
      'posts_per_page'    => sanitize_title( $atts['max_posts'] ),
      'post_type'         => 'club'
  ) );

  if( ! $loop->have_posts() ) {
    return;
  }

  $features = [];
  while( $loop->have_posts() ) {
      $loop->the_post();

    $feature = new stdClass();

    $feature->title = get_the_title();
    $feature->details = get_the_excerpt();
    $feature->link = get_the_permalink();
    $feature->image = get_the_post_thumbnail_url();
    $feature->latitude = get_field('latitude', false, false);
    $feature->longitude = get_field('longitude', false, false);

    array_push($features, $feature);

  }

  ?><div id="mapbox_map" style="width:100%; height:400px; margin-bottom: 100px;"></div><?php

  wp_localize_script( 'wp-mapbox-local-script', 'data', $features );
  wp_localize_script( 'wp-mapbox-local-script', 'plugin_url', plugins_url() . '/wp-mapbox/' );

  wp_reset_postdata();

}