USE ad_dss;

INSERT INTO ads (name, media_type, media_url, start_time, end_time, status, priority) VALUES
('Ad 1', 'image', '/media/images/ad1.jpg', CONCAT(CURDATE(), ' 10:00:00'), CONCAT(CURDATE(), ' 13:00:00'), 'active', 0),
('Ad 2', 'image', '/media/images/ad2.jpg', CONCAT(CURDATE(), ' 12:30:00'), CONCAT(CURDATE(), ' 15:00:00'), 'active', 0),
('Ad 3 - Standalone', 'gif', '/media/gifs/ad3.gif', CONCAT(CURDATE(), ' 16:00:00'), CONCAT(CURDATE(), ' 17:00:00'), 'active', 0),
('Ad 4 - Video Test', 'video', '/media/videos/ad4.mp4', CONCAT(CURDATE(), ' 09:00:00'), CONCAT(CURDATE(), ' 09:30:00'), 'active', 0);