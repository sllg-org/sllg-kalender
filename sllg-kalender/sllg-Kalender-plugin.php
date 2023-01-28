<?php
/**
Plugin Name: Kalender Atelier Burmehl
Plugin URI: https://github.com/LutzGausW/sllg-kalender
Description: Anzeige Veranstaltungskalender
Version: 1.0
Author: Lutz Gerlinger, Dank an Volker
Author URI: https://lutz.sllg.org
License: GPL2 
*/

// Register and load
// das Widget
function sllgkalender_load_widget() {
    register_widget( 'sllgkalender_widget' );
}
add_action( 'widgets_init', 'sllgkalender_load_widget' );
// die JS-Datei
function register_sllgkalender_scripts() {
    wp_register_script( 'kalender-script', plugins_url( 'kalender.js', __FILE__ ), array( 'jquery' ) ); 
    wp_enqueue_script( 'kalender-script' );
}
add_action( 'wp_enqueue_scripts', 'register_sllgkalender_scripts' );
// das Stylesheet 
function register_sllgkalender_styles() {
	wp_register_style( 'kalender-styles', plugins_url( 'sllg-kalender/kalender.css' ) );
	wp_enqueue_style( 'kalender-styles' );
}
add_action( 'wp_enqueue_scripts', 'register_sllgkalender_styles' );





// Creating the widget 
class sllgkalender_widget extends WP_Widget {

    function __construct() {
        parent::__construct(
        // Base ID of your widget
        'kalender_widget',
        // Widget name will appear in UI
        __('Kalender Atelier Burmehl', 'sllgkalender_widget_domain'),
        // Widget description
        array( 'description' => __( 'zeigt einen Kalender mit Termininformationen im overlay', 'sllgkalender_widget_domain' ), )
        );
    }

    // Creating widget front-end
    public function widget($args, $instance) {
        $title = apply_filters( 'widget_title', $instance['title'] );
		$widget_text = ! empty( $instance['text'] ) ? $instance['text'] : '';
		$text = apply_filters( 'widget_text', $widget_text, $instance, $this );

        // before and after widget arguments are defined by themes
        echo $args['before_widget'];
        if (! empty( $title )) {
            echo $args['before_title'] . $title . $args['after_title'];
		}
        if (! empty( $text )) {
            echo '<script>var veranstaltungen = ' . $text . ';</script>';
		}
        // This is where you run the code and display the output
        echo __( '
			<div class="veranstaltungskalender">
				<div class="kalenderAnsicht">
					
				</div>
                <div class="terminDetail"></div>
  			</div>
		', 'sllgkalender_widget_domain' );
        echo $args['after_widget'];
    }
        
// Widget Backend 
    public function form($instance) {
        if (isset( $instance[ 'title' ] )) {
            $title = $instance[ 'title' ];
        } else {
            $title = __( 'New title', 'sllgkalender_widget_domain' );
        }
		if (isset( $instance[ 'text' ] )) {
            $text = $instance[ 'text' ];
        } else {
            $text = __( '', 'sllgkalender_widget_domain' );
        }
        // Widget admin form
        ?>
        <p>
			<label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:' ); ?></label> 
			<input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>" />
    	</p>
		<p>
        	<label for="<?php echo $this->get_field_id( 'text' ); ?>"><?php _e( 'Termine:' ); ?></label> 
    		<textarea class="widefat" rows="16" cols="20" id="<?php echo $this->get_field_id( 'text' ); ?>" name="<?php echo $this->get_field_name( 'text' ); ?>"><?php echo esc_textarea( $text ); ?></textarea>
		</p>
		<?php
    }
    
// Updating widget replacing old instances with new
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
		if ( current_user_can( 'unfiltered_html' ) ) {
			$instance['text'] = $new_instance['text'];
		} else {
			$instance['text'] = wp_kses_post( $new_instance['text'] );
		}

        return $instance;
    }

} 
// Class sllgkalender_widget ends here

?>