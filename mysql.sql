CREATE  TABLE IF NOT EXISTS `onevo`.`device` (
  `_id` MEDIUMINT(9) NOT NULL AUTO_INCREMENT ,
  `id_device` VARCHAR(45) NULL ,
  `date_activation` DATE NULL ,
  PRIMARY KEY (`_id`) ,
  UNIQUE INDEX `_id_UNIQUE` (`_id` ASC) )
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `onevo`.`user_device` (
  `_id` MEDIUMINT(9) NOT NULL AUTO_INCREMENT ,
  `email` VARCHAR(45) NULL ,
  `id_device` VARCHAR(45) NULL ,
  `authorization` INT NULL ,
  `display_name` VARCHAR(45) NULL ,
  PRIMARY KEY (`_id`) ,
  UNIQUE INDEX `_id_UNIQUE` (`_id` ASC) )
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `onevo`.`resource_picture` (
  `_id` MEDIUMINT(9) NOT NULL AUTO_INCREMENT ,
  `bucket` VARCHAR(45) NULL ,
  `key` VARCHAR(45) NULL ,
  `name` VARCHAR(45) NULL ,
  `size` VARCHAR(45) NULL ,
  `type` VARCHAR(45) NULL ,
  `delete` INT NULL ,
  `datetime_upload` DOUBLE NULL ,
  PRIMARY KEY (`_id`) ,
  UNIQUE INDEX `_id_UNIQUE` (`_id` ASC) )
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `onevo`.`picture_device` (
  `_id` MEDIUMINT(9) NOT NULL AUTO_INCREMENT ,
  `key` VARCHAR(45) NULL ,
  `id_device` VARCHAR(45) NULL ,
  `datetime_create` DOUBLE NULL ,
  PRIMARY KEY (`_id`) ,
  UNIQUE INDEX `_id_UNIQUE` (`_id` ASC) )
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `onevo`.`user_device_history` (
  `_id` MEDIUMINT(9) NOT NULL AUTO_INCREMENT ,
  `email` VARCHAR(45) NULL ,
  `id_device` VARCHAR(45) NULL ,
  `datetime_login` DOUBLE NULL ,
  `ip_login` VARCHAR(45) NULL ,
  `datetime_create` DOUBLE NULL ,
  PRIMARY KEY (`_id`) ,
  UNIQUE INDEX `_id_UNIQUE` (`_id` ASC) )
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `onevo`.`video_device` (
  `_id` MEDIUMINT(9) NOT NULL AUTO_INCREMENT ,
  `key` VARCHAR(45) NULL ,
  `id_device` VARCHAR(45) NULL ,
  `datetime_create` DOUBLE NULL ,
  PRIMARY KEY (`_id`) ,
  UNIQUE INDEX `_id_UNIQUE` (`_id` ASC) )
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `onevo`.`resource_video` (
  `_id` MEDIUMINT(9) NOT NULL AUTO_INCREMENT ,
  `bucket` VARCHAR(45) NULL ,
  `key` VARCHAR(45) NULL ,
  `name` VARCHAR(45) NULL ,
  `size` VARCHAR(45) NULL ,
  `type` VARCHAR(45) NULL ,
  `delete` INT NULL ,
  `datetime_upload` DOUBLE NULL ,
  `datetime_start` DOUBLE NULL ,
  `datetime_end` DOUBLE NULL ,
  PRIMARY KEY (`_id`) ,
  UNIQUE INDEX `_id_UNIQUE` (`_id` ASC) )
ENGINE = InnoDB;

CREATE  TABLE IF NOT EXISTS `onevo`.`user` (
  `_id` MEDIUMINT(9) NOT NULL AUTO_INCREMENT ,
  `email` VARCHAR(45) NULL ,
  `password` VARCHAR(45) NULL ,
  `username` VARCHAR(45) NULL ,
  `phone` VARCHAR(45) NULL ,
  `datetime_lastlogin` DOUBLE NULL ,
  `datetime_signup` DOUBLE NULL ,
  `ip_lastlogin` VARCHAR(45) NULL ,
  PRIMARY KEY (`_id`) ,
  UNIQUE INDEX `_id_UNIQUE` (`_id` ASC) )
ENGINE = InnoDB;