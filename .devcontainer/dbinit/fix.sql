FLUSH PRIVILEGES ;
DROP USER ''@'localhost' ;
create database if not exists `photostestdb` ;
grant all privileges on `photostestdb`.* to 'photostestuser'@'%' identified by 'photostestpass' ;
FLUSH PRIVILEGES ;
