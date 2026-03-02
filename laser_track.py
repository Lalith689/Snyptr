import cv2
import numpy as np
import math
import time
import pygame
from pygame import gfxdraw

# ISSF 10m Air Pistol Target dimensions
# According to ISSF rules:
# 10 ring (bull's eye) = 11.5mm diameter
# Total target diameter = 155.5mm

# Constants for display
SCREEN_WIDTH = 1024
SCREEN_HEIGHT = 768
TARGET_CENTER_X = SCREEN_WIDTH // 2
TARGET_CENTER_Y = SCREEN_HEIGHT // 2

# Target parameters (in pixels for display)
BULL_RADIUS = 30  # Center (10 ring) radius
TARGET_RADIUS = 200  # Total target radius
RING_WIDTH = 19  # Width between rings

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
YELLOW = (255, 255, 0)
GRAY = (128, 128, 128)
BLUE = (0, 0, 255)

# LED status
led_status = {
    'red': False,
    'yellow': False,
    'green': False
}

class LaserDetectionSystem:
    def __init__(self):
        # Initialize camera
        self.cap = cv2.VideoCapture(0)  # Use default camera (change index if needed)
        if not self.cap.isOpened():
            raise Exception("Could not open camera")
        
        # Get camera frame dimensions
        _, frame = self.cap.read()
        self.frame_height, self.frame_width = frame.shape[:2]
        
        # Initialize pygame for visualization
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Laser Target Detection System")
        
        # Setup font
        self.font = pygame.font.SysFont('Arial', 24)
        self.small_font = pygame.font.SysFont('Arial', 16)
        
        # Initialize variables
        self.laser_x = 0
        self.laser_y = 0
        self.laser_detected = False
        self.distance = 0
        self.score = 0
        self.last_hit_time = 0
        self.show_hit = False
        self.error_message = ""
        self.error_time = 0
        
        # Target calibration
        self.cam_target_center_x = self.frame_width // 2
        self.cam_target_center_y = self.frame_height // 2
        self.cam_target_radius = min(self.frame_width, self.frame_height) // 3
        
        # Detection parameters
        self.laser_threshold = 220  # Brightness threshold for laser detection (0-255)
        self.min_laser_area = 5     # Minimum area for laser dot detection
        
        # Running control
        self.running = True
        self.show_camera = True
    
    def calculate_distance(self, x1, y1, x2, y2):
        """Calculate distance between two points"""
        return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    
    def set_leds(self, red, yellow, green):
        """Set LED states"""
        led_status['red'] = red
        led_status['yellow'] = yellow
        led_status['green'] = green
    
    def draw_target(self):
        """Draw the target on screen"""
        # Fill background
        self.screen.fill(BLACK)
        
        # Draw target rings from outside to inside
        for i in range(1, 11):
            radius = TARGET_RADIUS - (i - 1) * RING_WIDTH
            color = WHITE
            
            # Red bull's eye (10 ring)
            if i == 10:
                color = RED
            
            # Draw the ring
            pygame.gfxdraw.aacircle(self.screen, TARGET_CENTER_X, TARGET_CENTER_Y, radius, color)
            
            # Draw the ring number
            text = self.small_font.render(str(i), True, WHITE)
            text_rect = text.get_rect(center=(TARGET_CENTER_X + radius - 10, TARGET_CENTER_Y - 10))
            self.screen.blit(text, text_rect)
        
        # Mark the center with a small dot
        pygame.gfxdraw.filled_circle(self.screen, TARGET_CENTER_X, TARGET_CENTER_Y, 2, WHITE)
    
    def draw_leds(self):
        """Draw LED indicators on screen"""
        # LED positions
        led_positions = {
            'red': (50, 50),
            'yellow': (50, 100),
            'green': (50, 150)
        }
        
        # LED labels
        led_labels = {
            'red': "Outside Target",
            'yellow': "Near Center",
            'green': "Center Hit"
        }
        
        # Draw LEDs
        for led, pos in led_positions.items():
            color = GRAY  # Off state
            if led_status[led]:
                if led == 'red':
                    color = RED
                elif led == 'yellow':
                    color = YELLOW
                elif led == 'green':
                    color = GREEN
            
            # Draw LED circle
            pygame.gfxdraw.filled_circle(self.screen, pos[0], pos[1], 15, color)
            pygame.gfxdraw.aacircle(self.screen, pos[0], pos[1], 15, WHITE)
            
            # Draw LED label
            label = self.small_font.render(led_labels[led], True, WHITE)
            self.screen.blit(label, (pos[0] + 25, pos[1] - 8))
    
    def display_info(self):
        """Display information on screen"""
        # Show current score
        score_text = self.font.render(f"Score: {self.score}", True, WHITE)
        self.screen.blit(score_text, (SCREEN_WIDTH - 150, 20))
        
        # Show laser status
        status = "DETECTED" if self.laser_detected else "NOT DETECTED"
        status_color = GREEN if self.laser_detected else RED
        laser_text = self.font.render(f"Laser: {status}", True, status_color)
        self.screen.blit(laser_text, (SCREEN_WIDTH - 250, 60))
        
        # Show instructions
        instr_text = self.small_font.render("Press 'C' to toggle camera view, 'ESC' to exit", True, WHITE)
        self.screen.blit(instr_text, (SCREEN_WIDTH // 2 - 180, SCREEN_HEIGHT - 30))
        
        # Show error message if active
        if time.time() - self.error_time < 3:  # Show for 3 seconds
            error_surf = self.font.render(self.error_message, True, RED)
            self.screen.blit(error_surf, (SCREEN_WIDTH // 2 - 150, 20))
    
    def detect_laser(self, frame):
        """
        Detect laser dot in camera frame
        Returns: (detected, x, y) where x,y are coordinates if detected, else None
        """
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Threshold to find bright spots (laser)
        _, thresh = cv2.threshold(gray, self.laser_threshold, 255, cv2.THRESH_BINARY)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Find the largest contour that meets our criteria
        largest_area = 0
        largest_contour = None
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > self.min_laser_area and area > largest_area:
                largest_area = area
                largest_contour = contour
        
        # If we found a contour that could be the laser
        if largest_contour is not None:
            # Get the center of the contour
            M = cv2.moments(largest_contour)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                return True, cx, cy
        
        return False, None, None
    
    def process_laser_position(self, frame_x, frame_y):
        """Process laser position detected in camera frame"""
        # Map camera coordinates to target coordinates
        target_x = TARGET_CENTER_X + (frame_x - self.cam_target_center_x) * TARGET_RADIUS / self.cam_target_radius
        target_y = TARGET_CENTER_Y + (frame_y - self.cam_target_center_y) * TARGET_RADIUS / self.cam_target_radius
        
        self.laser_x = int(target_x)
        self.laser_y = int(target_y)
        self.last_hit_time = time.time()
        self.show_hit = True
        
        # Calculate distance from center
        self.distance = self.calculate_distance(target_x, target_y, TARGET_CENTER_X, TARGET_CENTER_Y)
        
        # Check if laser is within target
        if self.distance <= TARGET_RADIUS:
            # Calculate score based on distance
            ring_number = 10 - int(self.distance / RING_WIDTH)
            if ring_number < 1:
                ring_number = 1
            self.score = ring_number
            
            if self.distance <= BULL_RADIUS:
                # Laser is in the bull's eye (10 ring)
                self.set_leds(False, False, True)  # Green LED on
                self.score = 10
            else:
                # Laser is in target but not in bull's eye
                self.set_leds(False, True, False)  # Yellow LED on
        else:
            # Laser is outside the target
            self.set_leds(True, False, False)  # Red LED on
            self.error_message = "ERROR: Laser outside target bounds"
            self.error_time = time.time()
    
    def display_camera_frame(self, frame):
        """Display camera frame on pygame surface"""
        # Resize frame to fit in the display
        display_width = SCREEN_WIDTH // 3
        display_height = int(display_width * self.frame_height / self.frame_width)
        display_frame = cv2.resize(frame, (display_width, display_height))
        
        # Convert frame to pygame surface
        display_frame = cv2.cvtColor(display_frame, cv2.COLOR_BGR2RGB)
        display_frame = np.rot90(display_frame)
        display_frame = pygame.surfarray.make_surface(display_frame)
        display_frame = pygame.transform.flip(display_frame, True, False)
        
        # Position in bottom-right corner
        self.screen.blit(display_frame, (SCREEN_WIDTH - display_width - 10, SCREEN_HEIGHT - display_height - 40))
        
    def draw_target_overlay(self, frame):
        """Draw target overlay on camera frame"""
        # Draw the target circles on the camera feed for alignment
        cv2.circle(frame, (self.cam_target_center_x, self.cam_target_center_y), 
                  self.cam_target_radius, (0, 255, 0), 2)
        
        # Draw bull's eye
        bull_radius = int(self.cam_target_radius * BULL_RADIUS / TARGET_RADIUS)
        cv2.circle(frame, (self.cam_target_center_x, self.cam_target_center_y), 
                  bull_radius, (0, 0, 255), 2)
        
        return frame
    
    def run(self):
        """Main program loop"""
        clock = pygame.time.Clock()
        
        while self.running:
            # Event handling
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        self.running = False
                    elif event.key == pygame.K_c:
                        # Toggle camera view
                        self.show_camera = not self.show_camera
            
            # Capture frame from camera
            ret, frame = self.cap.read()
            if not ret:
                print("Failed to grab frame")
                break
            
            # Mirror frame for more intuitive interaction
            frame = cv2.flip(frame, 1)
            
            # Draw target overlay on camera frame
            overlay_frame = self.draw_target_overlay(frame.copy())
            
            # Detect laser in frame
            detected, laser_x, laser_y = self.detect_laser(frame)
            self.laser_detected = detected
            
            if detected:
                # Add visual indicator of detected laser position
                cv2.circle(overlay_frame, (laser_x, laser_y), 10, (0, 255, 255), -1)
                
                # Process the laser position
                self.process_laser_position(laser_x, laser_y)
            
            # Draw elements
            self.draw_target()
            self.draw_leds()
            self.display_info()
            
            # Draw camera frame if enabled
            if self.show_camera:
                self.display_camera_frame(overlay_frame)
            
            # Draw laser hit point if recent
            if self.show_hit and time.time() - self.last_hit_time < 0.5:  # Show for half second
                pygame.gfxdraw.filled_circle(self.screen, self.laser_x, self.laser_y, 5, BLUE)
                pygame.gfxdraw.aacircle(self.screen, self.laser_x, self.laser_y, 5, WHITE)
            
            # Update the display
            pygame.display.flip()
            
            # Cap the frame rate
            clock.tick(30)
        
        # Clean up
        self.cap.release()
        pygame.quit()


# Arduino LED control via serial (optional for hardware integration)
def setup_arduino():
    """
    Setup Arduino serial connection for LED control
    For real implementation with Arduino Uno
    """
    try:
        import serial
        arduino = serial.Serial('/dev/ttyACM0', 9600)  # Adjust port as needed
        return arduino
    except:
        print("Arduino connection failed. Running without hardware LEDs.")
        return None


def update_arduino_leds(arduino, red, yellow, green):
    """
    Send LED states to Arduino
    Format: "LED:R{0/1}Y{0/1}G{0/1}\n"
    """
    if arduino:
        cmd = f"LED:R{1 if red else 0}Y{1 if yellow else 0}G{1 if green else 0}\n"
        arduino.write(cmd.encode())


# Main function
def main():
    # Setup Arduino (optional)
    # arduino = setup_arduino()
    
    try:
        # Create and run laser detection system
        laser_system = LaserDetectionSystem()
        laser_system.run()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()