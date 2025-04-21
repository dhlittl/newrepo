CREATE DATABASE  IF NOT EXISTS `team24database` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `team24database`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: cpsc4911.cobd8enwsupz.us-east-1.rds.amazonaws.com    Database: team24database
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `About_Page`
--

DROP TABLE IF EXISTS `About_Page`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `About_Page` (
  `TeamNumber` int DEFAULT NULL,
  `SprintNumber` int DEFAULT NULL,
  `ReleaseDate` date DEFAULT NULL,
  `ProductName` varchar(50) DEFAULT NULL,
  `ProductDescription` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `About_Page`
--

LOCK TABLES `About_Page` WRITE;
/*!40000 ALTER TABLE `About_Page` DISABLE KEYS */;
INSERT INTO `About_Page` VALUES (24,11,'2025-04-18','Happy Driverz Inc','Encouraging good driving!'),(25,100,'2024-02-12','TESTING2','TESTING3'),(25,100,'2024-02-12','TESTING2','TESTING3'),(25,100,'2024-02-12','TESTING2','TESTING3'),(25,200,'2024-02-12','TESTING3','TESTING4'),(25,200,'2024-02-13','TESTING2','TESTING3'),(24,3,'2025-02-20','Happy Drivers','About page functionality, sponsor registration and sponsor info, cognito user pool setup, admin and sponsor dashboard pages, fixed broken pages and made default user page with widgets'),(24,4,'2025-02-27','HappyDriverz','Application to help sponsors incentivize drivers'),(24,5,'2024-03-06','HappyDriverzInc','Application to assist Sponsors in incentivizing Drivers'),(24,5,'2025-03-06','HappyDriverzInc','Application to assist Sponsors in incentivizing Drivers'),(24,10,'2025-04-18','Happy Driverz Inc','Encouraging good driving!'),(24,11,'2025-04-20','Happy Driverz Inc','Encouraging good driving!');
/*!40000 ALTER TABLE `About_Page` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Admin`
--

DROP TABLE IF EXISTS `Admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin` (
  `Admin_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int DEFAULT NULL,
  PRIMARY KEY (`Admin_ID`),
  UNIQUE KEY `User_ID` (`User_ID`),
  CONSTRAINT `Admin_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin`
--

LOCK TABLES `Admin` WRITE;
/*!40000 ALTER TABLE `Admin` DISABLE KEYS */;
INSERT INTO `Admin` VALUES (11,57),(12,58),(13,92);
/*!40000 ALTER TABLE `Admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Admin_Preferences`
--

DROP TABLE IF EXISTS `Admin_Preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin_Preferences` (
  `User_ID` int NOT NULL,
  `Widget_Order` json NOT NULL,
  PRIMARY KEY (`User_ID`),
  CONSTRAINT `Admin_Preferences_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin_Preferences`
--

LOCK TABLES `Admin_Preferences` WRITE;
/*!40000 ALTER TABLE `Admin_Preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `Admin_Preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Application_Questions`
--

DROP TABLE IF EXISTS `Application_Questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Application_Questions` (
  `Application_ID` int NOT NULL AUTO_INCREMENT,
  `Sponsor_Org_ID` int DEFAULT NULL,
  `Question1` varchar(1000) DEFAULT NULL,
  `Question2` varchar(1000) DEFAULT NULL,
  `Question3` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`Application_ID`),
  KEY `Sponsor_Org_ID` (`Sponsor_Org_ID`),
  CONSTRAINT `Application_Questions_ibfk_1` FOREIGN KEY (`Sponsor_Org_ID`) REFERENCES `Sponsor_Organization` (`Sponsor_Org_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Application_Questions`
--

LOCK TABLES `Application_Questions` WRITE;
/*!40000 ALTER TABLE `Application_Questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `Application_Questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Audit_Log`
--

DROP TABLE IF EXISTS `Audit_Log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Audit_Log` (
  `Audit_ID` int NOT NULL AUTO_INCREMENT,
  `Event_Type` enum('Driver Applications','Point Changes','Password Changes','Login Attempts') DEFAULT NULL,
  `User_ID` int DEFAULT NULL,
  `Target_Entity` enum('Driver','Sponsor') DEFAULT NULL,
  `Target_ID` int DEFAULT NULL,
  `Action_Description` text,
  `Timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `Metadata` json DEFAULT NULL,
  PRIMARY KEY (`Audit_ID`),
  KEY `Audit_Log_ibfk_1` (`User_ID`),
  CONSTRAINT `Audit_Log_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=489 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Audit_Log`
--

LOCK TABLES `Audit_Log` WRITE;
/*!40000 ALTER TABLE `Audit_Log` DISABLE KEYS */;
INSERT INTO `Audit_Log` VALUES (20,'Point Changes',NULL,'Sponsor',1,'ADD','2025-04-18 22:58:45','{\"Reason\": \"audit test\"}'),(21,'Point Changes',NULL,'Sponsor',1,'ADD','2025-04-18 22:58:49','{\"Reason\": \"audit test\"}'),(22,'Point Changes',NULL,'Sponsor',1,'ADD','2025-04-18 23:07:52','{\"Reason\": \"audit test\"}'),(23,'Point Changes',NULL,'Sponsor',1,'ADD','2025-04-18 23:07:58','{\"Reason\": \"audit test\"}'),(67,'Driver Applications',63,'Driver',1,'Received submission','2025-04-19 22:45:31','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 22:45:31.000000\", \"Application_ID\": 31}'),(70,'Point Changes',1,'Sponsor',1,'SUB','2025-04-19 23:05:20','{\"Reason\": \"Product purchase\"}'),(72,'Driver Applications',63,'Driver',1,'Denied','2025-04-19 23:17:58','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 22:45:31.000000\", \"Application_ID\": 31}'),(73,'Driver Applications',63,'Driver',1,'Received submission','2025-04-19 23:19:54','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 23:19:54.000000\", \"Application_ID\": 32}'),(74,'Driver Applications',63,'Driver',2,'Received submission','2025-04-19 23:20:04','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 23:20:04.000000\", \"Application_ID\": 33}'),(75,'Driver Applications',63,'Driver',3,'Received submission','2025-04-19 23:20:12','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 23:20:12.000000\", \"Application_ID\": 34}'),(83,'Driver Applications',63,'Driver',1,'Approved','2025-04-19 23:37:06','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 23:19:54.000000\", \"Application_ID\": 32}'),(84,'Driver Applications',63,'Driver',1,'Approved','2025-04-19 23:37:06','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 23:19:54.000000\", \"Application_ID\": 32}'),(85,'Driver Applications',63,'Driver',2,'Approved','2025-04-19 23:51:31','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 23:20:04.000000\", \"Application_ID\": 33}'),(86,'Driver Applications',63,'Driver',2,'Approved','2025-04-19 23:51:31','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 23:20:04.000000\", \"Application_ID\": 33}'),(87,'Driver Applications',63,'Driver',3,'Approved','2025-04-20 00:44:49','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 23:20:12.000000\", \"Application_ID\": 34}'),(88,'Driver Applications',63,'Driver',3,'Approved','2025-04-20 00:44:49','{\"Email\": \"johndoe@fake.com\", \"FName\": \"John\", \"LName\": \"Doe\", \"Submitted_At\": \"2025-04-19 23:20:12.000000\", \"Application_ID\": 34}'),(89,'Point Changes',1,'Sponsor',1,'ADD','2025-04-20 00:55:30','{\"Reason\": \"Set Davis\' points to 0\"}'),(90,'Point Changes',1,'Sponsor',1,'ADD','2025-04-20 00:56:30','{\"Reason\": \"Because Davis is the best\"}'),(91,'Driver Applications',64,'Driver',1,'Received submission','2025-04-20 00:57:32','{\"Email\": \"driver@fake.com\", \"FName\": \"George\", \"LName\": \"Washington\", \"Submitted_At\": \"2025-04-20 00:57:32.000000\", \"Application_ID\": 35}'),(92,'Driver Applications',64,'Driver',2,'Received submission','2025-04-20 00:57:48','{\"Email\": \"driver@fake.com\", \"FName\": \"George\", \"LName\": \"Washington\", \"Submitted_At\": \"2025-04-20 00:57:48.000000\", \"Application_ID\": 36}'),(93,'Driver Applications',64,'Driver',3,'Received submission','2025-04-20 00:58:08','{\"Email\": \"driver@fake.com\", \"FName\": \"George\", \"LName\": \"Washington\", \"Submitted_At\": \"2025-04-20 00:58:08.000000\", \"Application_ID\": 37}'),(94,'Driver Applications',64,'Driver',1,'Approved','2025-04-20 00:58:49','{\"Email\": \"driver@fake.com\", \"FName\": \"George\", \"LName\": \"Washington\", \"Submitted_At\": \"2025-04-20 00:57:32.000000\", \"Application_ID\": 35}'),(95,'Driver Applications',64,'Driver',1,'Approved','2025-04-20 00:58:49','{\"Email\": \"driver@fake.com\", \"FName\": \"George\", \"LName\": \"Washington\", \"Submitted_At\": \"2025-04-20 00:57:32.000000\", \"Application_ID\": 35}'),(96,'Driver Applications',65,'Driver',1,'Received submission','2025-04-20 01:36:32','{\"Email\": \"driver@fake.com\", \"FName\": \"Maggie\", \"LName\": \"Smith\", \"Submitted_At\": \"2025-04-20 01:36:32.000000\", \"Application_ID\": 38}'),(97,'Point Changes',1,'Sponsor',1,'SUB','2025-04-20 01:55:49','{\"Reason\": \"Product purchase\"}'),(98,'Point Changes',1,'Sponsor',2,'SUB','2025-04-20 02:23:08','{\"Reason\": \"Product purchase\"}'),(99,'Driver Applications',65,'Driver',1,'Approved','2025-04-20 02:34:39','{\"Email\": \"driver@fake.com\", \"FName\": \"Maggie\", \"LName\": \"Smith\", \"Submitted_At\": \"2025-04-20 01:36:32.000000\", \"Application_ID\": 38}'),(100,'Driver Applications',65,'Driver',1,'Approved','2025-04-20 02:34:39','{\"Email\": \"driver@fake.com\", \"FName\": \"Maggie\", \"LName\": \"Smith\", \"Submitted_At\": \"2025-04-20 01:36:32.000000\", \"Application_ID\": 38}'),(101,'Driver Applications',66,'Driver',1,'Received submission','2025-04-20 02:44:02','{\"Email\": \"ddarko@fake.com\", \"FName\": \"Donnie\", \"LName\": \"Darko\", \"Submitted_At\": \"2025-04-20 02:44:02.000000\", \"Application_ID\": 39}'),(102,'Driver Applications',66,'Driver',2,'Received submission','2025-04-20 02:44:10','{\"Email\": \"ddarko@fake.com\", \"FName\": \"Donnie\", \"LName\": \"Darko\", \"Submitted_At\": \"2025-04-20 02:44:10.000000\", \"Application_ID\": 40}'),(103,'Driver Applications',66,'Driver',1,'Approved','2025-04-20 02:46:09','{\"Email\": \"ddarko@fake.com\", \"FName\": \"Donnie\", \"LName\": \"Darko\", \"Submitted_At\": \"2025-04-20 02:44:02.000000\", \"Application_ID\": 39}'),(104,'Driver Applications',66,'Driver',1,'Approved','2025-04-20 02:46:09','{\"Email\": \"ddarko@fake.com\", \"FName\": \"Donnie\", \"LName\": \"Darko\", \"Submitted_At\": \"2025-04-20 02:44:02.000000\", \"Application_ID\": 39}'),(105,'Driver Applications',77,'Driver',3,'Received submission','2025-04-20 02:52:03','{\"Email\": \"steve@fake.com\", \"FName\": \"Steve\", \"LName\": \"Le Puisson\", \"Submitted_At\": \"2025-04-20 02:52:03.000000\", \"Application_ID\": 41}'),(106,'Driver Applications',77,'Driver',2,'Received submission','2025-04-20 02:52:17','{\"Email\": \"steve@fake.com\", \"FName\": \"Steve\", \"LName\": \"Le Puisson\", \"Submitted_At\": \"2025-04-20 02:52:17.000000\", \"Application_ID\": 42}'),(107,'Driver Applications',77,'Driver',2,'Denied','2025-04-20 02:54:27','{\"Email\": \"steve@fake.com\", \"FName\": \"Steve\", \"LName\": \"Le Puisson\", \"Submitted_At\": \"2025-04-20 02:52:17.000000\", \"Application_ID\": 42}'),(108,'Driver Applications',77,'Driver',2,'Denied','2025-04-20 02:54:27','{\"Email\": \"steve@fake.com\", \"FName\": \"Steve\", \"LName\": \"Le Puisson\", \"Submitted_At\": \"2025-04-20 02:52:17.000000\", \"Application_ID\": 42}'),(109,'Driver Applications',77,'Driver',3,'Approved','2025-04-20 02:56:34','{\"Email\": \"steve@fake.com\", \"FName\": \"Steve\", \"LName\": \"Le Puisson\", \"Submitted_At\": \"2025-04-20 02:52:03.000000\", \"Application_ID\": 41}'),(110,'Driver Applications',77,'Driver',3,'Approved','2025-04-20 02:56:34','{\"Email\": \"steve@fake.com\", \"FName\": \"Steve\", \"LName\": \"Le Puisson\", \"Submitted_At\": \"2025-04-20 02:52:03.000000\", \"Application_ID\": 41}'),(111,'Point Changes',1,'Sponsor',2,'ADD','2025-04-20 03:02:22','{\"Reason\": \"He is really cool\"}'),(112,'Login Attempts',1,'Driver',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 14:14:50','{\"status\": \"PENDING\"}'),(113,'Login Attempts',1,'Driver',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 14:18:00','{\"status\": \"PENDING\"}'),(114,'Login Attempts',1,'Driver',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 14:19:45','{\"status\": \"PENDING\"}'),(115,'Login Attempts',1,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 14:23:21','{\"status\": \"PENDING\"}'),(116,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 14:26:34','{\"status\": \"PENDING\"}'),(117,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 14:26:34','{\"status\": \"PENDING\"}'),(118,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 14:59:55','{\"status\": \"SUCCESS\"}'),(119,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 14:59:55','{\"status\": \"SUCCESS\"}'),(120,'Login Attempts',78,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 15:42:01','{\"status\": \"PENDING\"}'),(121,'Login Attempts',78,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 15:42:03','{\"status\": \"SUCCESS\"}'),(122,'Driver Applications',78,'Driver',2,'Received submission','2025-04-20 15:46:56','{\"Email\": \"avbcarson@gmail.com\", \"FName\": \"Avery\", \"LName\": \"Carson\", \"Submitted_At\": \"2025-04-20 15:46:56.000000\", \"Application_ID\": 43}'),(123,'Driver Applications',78,'Driver',2,'Received submission','2025-04-20 15:46:58','{\"Email\": \"avbcarson@gmail.com\", \"FName\": \"Avery\", \"LName\": \"Carson\", \"Submitted_At\": \"2025-04-20 15:46:58.000000\", \"Application_ID\": 44}'),(124,'Driver Applications',78,'Driver',2,'Denied','2025-04-20 15:48:36','{\"Email\": \"avbcarson@gmail.com\", \"FName\": \"Avery\", \"LName\": \"Carson\", \"Submitted_At\": \"2025-04-20 15:46:56.000000\", \"Application_ID\": 43}'),(125,'Driver Applications',78,'Driver',2,'Denied','2025-04-20 15:48:36','{\"Email\": \"avbcarson@gmail.com\", \"FName\": \"Avery\", \"LName\": \"Carson\", \"Submitted_At\": \"2025-04-20 15:46:56.000000\", \"Application_ID\": 43}'),(126,'Driver Applications',78,'Driver',2,'Approved','2025-04-20 15:49:10','{\"Email\": \"avbcarson@gmail.com\", \"FName\": \"Avery\", \"LName\": \"Carson\", \"Submitted_At\": \"2025-04-20 15:46:58.000000\", \"Application_ID\": 44}'),(127,'Driver Applications',78,'Driver',2,'Approved','2025-04-20 15:49:10','{\"Email\": \"avbcarson@gmail.com\", \"FName\": \"Avery\", \"LName\": \"Carson\", \"Submitted_At\": \"2025-04-20 15:46:58.000000\", \"Application_ID\": 44}'),(128,'Login Attempts',61,'Sponsor',2,'Login attempt via Cognito (PreAuth)','2025-04-20 15:53:39','{\"status\": \"PENDING\"}'),(129,'Login Attempts',61,'Sponsor',2,'Login attempt via Cognito (PreAuth)','2025-04-20 15:53:45','{\"status\": \"PENDING\"}'),(130,'Login Attempts',61,'Sponsor',2,'Login successful via Cognito (PostAuth)','2025-04-20 15:53:46','{\"status\": \"SUCCESS\"}'),(131,'Point Changes',78,'Sponsor',2,'ADD','2025-04-20 15:56:30','{\"Reason\": \"Wearing a Seatbelt\"}'),(132,'Point Changes',78,'Sponsor',2,'ADD','2025-04-20 15:58:06','{\"Reason\": \"Stop at Stop Signs\"}'),(133,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 16:05:04','{\"status\": \"PENDING\"}'),(134,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 16:05:04','{\"status\": \"PENDING\"}'),(135,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 16:05:07','{\"status\": \"SUCCESS\"}'),(136,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 16:05:07','{\"status\": \"SUCCESS\"}'),(137,'Login Attempts',58,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 16:08:43','{\"status\": \"PENDING\"}'),(138,'Login Attempts',58,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 16:08:45','{\"status\": \"SUCCESS\"}'),(139,'Login Attempts',64,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 16:10:29','{\"status\": \"PENDING\"}'),(140,'Login Attempts',64,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 16:10:30','{\"status\": \"SUCCESS\"}'),(141,'Login Attempts',61,'Sponsor',2,'Login attempt via Cognito (PreAuth)','2025-04-20 16:10:47','{\"status\": \"PENDING\"}'),(142,'Login Attempts',61,'Sponsor',2,'Login successful via Cognito (PostAuth)','2025-04-20 16:10:48','{\"status\": \"SUCCESS\"}'),(143,'Point Changes',78,'Sponsor',2,'SUB','2025-04-20 16:11:40','{\"Reason\": \"Product purchase\"}'),(144,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 16:26:46','{\"status\": \"PENDING\"}'),(145,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 16:26:46','{\"status\": \"PENDING\"}'),(146,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 16:26:49','{\"status\": \"SUCCESS\"}'),(147,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 16:26:49','{\"status\": \"SUCCESS\"}'),(148,'Login Attempts',61,'Sponsor',2,'Login attempt via Cognito (PreAuth)','2025-04-20 16:27:04','{\"status\": \"PENDING\"}'),(149,'Login Attempts',61,'Sponsor',2,'Login successful via Cognito (PostAuth)','2025-04-20 16:27:05','{\"status\": \"SUCCESS\"}'),(150,'Point Changes',1,'Sponsor',2,'SUB','2025-04-20 16:27:28','{\"Reason\": \"Product purchase\"}'),(151,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 16:28:18','{\"status\": \"PENDING\"}'),(152,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 16:28:18','{\"status\": \"PENDING\"}'),(153,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 16:28:20','{\"status\": \"SUCCESS\"}'),(154,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 16:28:20','{\"status\": \"SUCCESS\"}'),(155,'Login Attempts',61,'Sponsor',2,'Login attempt via Cognito (PreAuth)','2025-04-20 16:29:08','{\"status\": \"PENDING\"}'),(156,'Login Attempts',61,'Sponsor',2,'Login successful via Cognito (PostAuth)','2025-04-20 16:29:10','{\"status\": \"SUCCESS\"}'),(157,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 16:30:05','{\"status\": \"PENDING\"}'),(158,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 16:30:05','{\"status\": \"PENDING\"}'),(159,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 16:30:07','{\"status\": \"SUCCESS\"}'),(160,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 16:30:07','{\"status\": \"SUCCESS\"}'),(161,'Point Changes',1,'Sponsor',1,'SUB','2025-04-20 16:34:32','{\"Reason\": \"Product purchase\"}'),(162,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 16:35:04','{\"status\": \"PENDING\"}'),(163,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 16:35:04','{\"status\": \"PENDING\"}'),(164,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 16:35:06','{\"status\": \"SUCCESS\"}'),(165,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 16:35:06','{\"status\": \"SUCCESS\"}'),(166,'Login Attempts',61,'Sponsor',2,'Login attempt via Cognito (PreAuth)','2025-04-20 17:29:30','{\"status\": \"PENDING\"}'),(167,'Login Attempts',61,'Sponsor',2,'Login successful via Cognito (PostAuth)','2025-04-20 17:29:32','{\"status\": \"SUCCESS\"}'),(168,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 17:43:03','{\"status\": \"PENDING\"}'),(169,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 17:43:03','{\"status\": \"PENDING\"}'),(170,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 17:43:06','{\"status\": \"SUCCESS\"}'),(171,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 17:43:06','{\"status\": \"SUCCESS\"}'),(172,'Point Changes',1,'Sponsor',1,'SUB','2025-04-20 17:45:40','{\"Reason\": \"Did a bad\"}'),(173,'Login Attempts',79,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 18:04:19','{\"status\": \"PENDING\"}'),(174,'Login Attempts',79,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 18:04:22','{\"status\": \"SUCCESS\"}'),(175,'Driver Applications',79,'Driver',2,'Received submission','2025-04-20 18:06:08','{\"Email\": \"samevins202@gmail.com\", \"FName\": \"Martin\", \"LName\": \"Floor\", \"Submitted_At\": \"2025-04-20 18:06:08.000000\", \"Application_ID\": 45}'),(176,'Login Attempts',58,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 18:06:46','{\"status\": \"PENDING\"}'),(177,'Login Attempts',58,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 18:06:48','{\"status\": \"SUCCESS\"}'),(178,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 18:13:07','{\"status\": \"PENDING\"}'),(179,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 18:13:09','{\"status\": \"SUCCESS\"}'),(180,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:13:57','{\"status\": \"PENDING\"}'),(181,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 18:13:58','{\"status\": \"PENDING\"}'),(182,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:13:59','{\"status\": \"SUCCESS\"}'),(183,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 18:13:59','{\"status\": \"SUCCESS\"}'),(184,'Point Changes',1,'Sponsor',1,'SUB','2025-04-20 18:20:11','{\"Reason\": \"Product purchase\"}'),(185,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:26:14','{\"status\": \"PENDING\"}'),(186,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 18:26:14','{\"status\": \"PENDING\"}'),(187,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:26:16','{\"status\": \"SUCCESS\"}'),(188,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 18:26:16','{\"status\": \"SUCCESS\"}'),(189,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:26:36','{\"status\": \"PENDING\"}'),(190,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:26:38','{\"status\": \"SUCCESS\"}'),(191,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:34:01','{\"status\": \"PENDING\"}'),(192,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:34:01','{\"status\": \"PENDING\"}'),(193,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:34:02','{\"status\": \"PENDING\"}'),(194,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:34:02','{\"status\": \"PENDING\"}'),(195,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:34:34','{\"status\": \"PENDING\"}'),(196,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:34:37','{\"status\": \"SUCCESS\"}'),(197,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:35:34','{\"status\": \"PENDING\"}'),(198,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 18:35:34','{\"status\": \"PENDING\"}'),(199,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:35:37','{\"status\": \"SUCCESS\"}'),(200,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 18:35:37','{\"status\": \"SUCCESS\"}'),(201,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:38:39','{\"status\": \"PENDING\"}'),(202,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 18:38:39','{\"status\": \"PENDING\"}'),(203,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:38:40','{\"status\": \"SUCCESS\"}'),(204,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 18:38:40','{\"status\": \"SUCCESS\"}'),(205,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:39:49','{\"status\": \"PENDING\"}'),(206,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:39:51','{\"status\": \"SUCCESS\"}'),(207,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:51:21','{\"status\": \"PENDING\"}'),(208,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 18:51:21','{\"status\": \"PENDING\"}'),(209,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:51:23','{\"status\": \"SUCCESS\"}'),(210,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 18:51:23','{\"status\": \"SUCCESS\"}'),(211,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:53:07','{\"status\": \"PENDING\"}'),(212,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:53:08','{\"status\": \"SUCCESS\"}'),(213,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:56:21','{\"status\": \"PENDING\"}'),(214,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 18:56:21','{\"status\": \"PENDING\"}'),(215,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:56:22','{\"status\": \"SUCCESS\"}'),(216,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 18:56:22','{\"status\": \"SUCCESS\"}'),(217,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:57:44','{\"status\": \"PENDING\"}'),(218,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:57:46','{\"status\": \"SUCCESS\"}'),(219,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 18:58:54','{\"status\": \"PENDING\"}'),(220,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 18:58:54','{\"status\": \"PENDING\"}'),(221,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 18:58:56','{\"status\": \"SUCCESS\"}'),(222,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 18:58:56','{\"status\": \"SUCCESS\"}'),(223,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 18:59:03','{\"status\": \"PENDING\"}'),(224,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 18:59:04','{\"status\": \"SUCCESS\"}'),(225,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 19:02:47','{\"status\": \"PENDING\"}'),(226,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 19:02:47','{\"status\": \"PENDING\"}'),(227,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 19:02:49','{\"status\": \"SUCCESS\"}'),(228,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 19:02:49','{\"status\": \"SUCCESS\"}'),(229,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 19:04:25','{\"status\": \"PENDING\"}'),(230,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 19:04:27','{\"status\": \"SUCCESS\"}'),(231,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 19:05:21','{\"status\": \"PENDING\"}'),(232,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 19:05:21','{\"status\": \"PENDING\"}'),(233,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 19:05:22','{\"status\": \"SUCCESS\"}'),(234,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 19:05:22','{\"status\": \"SUCCESS\"}'),(235,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 19:07:50','{\"status\": \"PENDING\"}'),(236,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 19:07:51','{\"status\": \"SUCCESS\"}'),(237,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 19:11:32','{\"status\": \"PENDING\"}'),(238,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 19:11:34','{\"status\": \"SUCCESS\"}'),(239,'Point Changes',1,'Sponsor',1,'ADD','2025-04-20 19:12:11','{\"Reason\": \"points test\"}'),(240,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 19:13:02','{\"status\": \"PENDING\"}'),(241,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 19:13:02','{\"status\": \"PENDING\"}'),(242,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 19:13:04','{\"status\": \"SUCCESS\"}'),(243,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 19:13:04','{\"status\": \"SUCCESS\"}'),(244,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 19:13:26','{\"status\": \"PENDING\"}'),(245,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 19:13:40','{\"status\": \"PENDING\"}'),(246,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 19:13:42','{\"status\": \"SUCCESS\"}'),(247,'Point Changes',1,'Sponsor',1,'SUB','2025-04-20 19:14:04','{\"Reason\": \"points test\"}'),(248,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 19:15:19','{\"status\": \"PENDING\"}'),(249,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 19:15:21','{\"status\": \"SUCCESS\"}'),(250,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 19:15:34','{\"status\": \"PENDING\"}'),(251,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 19:15:35','{\"status\": \"SUCCESS\"}'),(252,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 19:19:55','{\"status\": \"PENDING\"}'),(253,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 19:19:57','{\"status\": \"SUCCESS\"}'),(254,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 19:31:16','{\"status\": \"PENDING\"}'),(255,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 19:31:18','{\"status\": \"SUCCESS\"}'),(256,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 19:31:26','{\"status\": \"PENDING\"}'),(257,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 19:31:28','{\"status\": \"SUCCESS\"}'),(258,'Point Changes',1,'Sponsor',1,'ADD','2025-04-20 19:33:11','{\"Reason\": \"add points to multiple\"}'),(259,'Point Changes',63,'Sponsor',1,'ADD','2025-04-20 19:33:18','{\"Reason\": \"add points to multiple\"}'),(260,'Point Changes',64,'Sponsor',1,'ADD','2025-04-20 19:33:21','{\"Reason\": \"add points to multiple\"}'),(261,'Point Changes',1,'Sponsor',1,'ADD','2025-04-20 19:35:01','{\"Reason\": \"test\"}'),(262,'Point Changes',63,'Sponsor',1,'ADD','2025-04-20 19:35:06','{\"Reason\": \"test\"}'),(263,'Point Changes',64,'Sponsor',1,'ADD','2025-04-20 19:35:10','{\"Reason\": \"test\"}'),(264,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 19:38:56','{\"status\": \"PENDING\"}'),(265,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 19:38:58','{\"status\": \"SUCCESS\"}'),(266,'Password Changes',2,'Sponsor',1,'Password reset requested','2025-04-20 19:40:55','{\"email\": \"mdiazdu@clemson.edu\", \"clientId\": \"testClient\"}'),(267,'Point Changes',1,'Sponsor',1,'ADD','2025-04-20 19:54:24','{\"Reason\": \"loading demonstration\"}'),(268,'Point Changes',63,'Sponsor',1,'ADD','2025-04-20 19:54:31','{\"Reason\": \"loading demonstration\"}'),(269,'Point Changes',64,'Sponsor',1,'ADD','2025-04-20 19:54:34','{\"Reason\": \"loading demonstration\"}'),(270,'Login Attempts',61,'Sponsor',2,'Login attempt via Cognito (PreAuth)','2025-04-20 19:56:57','{\"status\": \"PENDING\"}'),(271,'Login Attempts',61,'Sponsor',2,'Login successful via Cognito (PostAuth)','2025-04-20 19:56:59','{\"status\": \"SUCCESS\"}'),(272,'Password Changes',2,'Sponsor',1,'Password reset requested','2025-04-20 20:12:53','{\"email\": \"mdiazdu@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(273,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 20:13:25','{\"status\": \"PENDING\"}'),(274,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 20:13:27','{\"status\": \"SUCCESS\"}'),(275,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 20:19:10','{\"status\": \"PENDING\"}'),(276,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 20:19:10','{\"status\": \"PENDING\"}'),(277,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 20:19:12','{\"status\": \"SUCCESS\"}'),(278,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 20:19:12','{\"status\": \"SUCCESS\"}'),(279,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 20:26:50','{\"status\": \"PENDING\"}'),(280,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 20:26:52','{\"status\": \"SUCCESS\"}'),(281,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 20:45:17','{\"status\": \"PENDING\"}'),(282,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 20:45:19','{\"status\": \"SUCCESS\"}'),(283,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 21:07:15','{\"status\": \"PENDING\"}'),(284,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 21:07:18','{\"status\": \"SUCCESS\"}'),(285,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 21:12:33','{\"status\": \"PENDING\"}'),(286,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 21:12:33','{\"status\": \"PENDING\"}'),(287,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 21:12:36','{\"status\": \"SUCCESS\"}'),(288,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 21:12:36','{\"status\": \"SUCCESS\"}'),(289,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 21:13:32','{\"status\": \"PENDING\"}'),(290,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 21:13:32','{\"status\": \"PENDING\"}'),(291,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 21:13:34','{\"status\": \"SUCCESS\"}'),(292,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 21:13:34','{\"status\": \"SUCCESS\"}'),(293,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 21:16:26','{\"status\": \"PENDING\"}'),(294,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 21:16:28','{\"status\": \"SUCCESS\"}'),(295,'Login Attempts',63,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 21:55:40','{\"status\": \"PENDING\"}'),(296,'Login Attempts',63,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 21:55:40','{\"status\": \"PENDING\"}'),(297,'Login Attempts',63,'Driver',3,'Login attempt via Cognito (PreAuth)','2025-04-20 21:55:40','{\"status\": \"PENDING\"}'),(298,'Login Attempts',63,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 21:55:42','{\"status\": \"SUCCESS\"}'),(299,'Login Attempts',63,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 21:55:42','{\"status\": \"SUCCESS\"}'),(300,'Login Attempts',63,'Driver',3,'Login successful via Cognito (PostAuth)','2025-04-20 21:55:42','{\"status\": \"SUCCESS\"}'),(301,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 22:03:10','{\"status\": \"PENDING\"}'),(302,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 22:03:12','{\"status\": \"SUCCESS\"}'),(303,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 22:28:54','{\"status\": \"PENDING\"}'),(304,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 22:28:56','{\"status\": \"SUCCESS\"}'),(305,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 22:29:37','{\"status\": \"PENDING\"}'),(306,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 22:29:39','{\"status\": \"SUCCESS\"}'),(307,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 22:38:21','{\"status\": \"PENDING\"}'),(308,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 22:38:24','{\"status\": \"SUCCESS\"}'),(309,'Password Changes',1,'Driver',1,'Password reset requested','2025-04-20 22:59:50','{\"email\": \"dhlittl@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(310,'Password Changes',1,'Driver',2,'Password reset requested','2025-04-20 22:59:50','{\"email\": \"dhlittl@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(311,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 23:05:45','{\"status\": \"PENDING\"}'),(312,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 23:05:45','{\"status\": \"PENDING\"}'),(313,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 23:05:47','{\"status\": \"SUCCESS\"}'),(314,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 23:05:47','{\"status\": \"SUCCESS\"}'),(315,'Password Changes',1,'Driver',1,'Password reset requested','2025-04-20 23:06:11','{\"email\": \"dhlittl@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(316,'Password Changes',1,'Driver',2,'Password reset requested','2025-04-20 23:06:11','{\"email\": \"dhlittl@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(317,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 23:06:52','{\"status\": \"PENDING\"}'),(318,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 23:06:52','{\"status\": \"PENDING\"}'),(319,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 23:06:54','{\"status\": \"SUCCESS\"}'),(320,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 23:06:54','{\"status\": \"SUCCESS\"}'),(321,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 23:09:43','{\"status\": \"PENDING\"}'),(322,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 23:09:43','{\"status\": \"PENDING\"}'),(323,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 23:09:45','{\"status\": \"SUCCESS\"}'),(324,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 23:09:45','{\"status\": \"SUCCESS\"}'),(325,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 23:14:57','{\"status\": \"PENDING\"}'),(326,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 23:14:59','{\"status\": \"SUCCESS\"}'),(327,'Login Attempts',58,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-20 23:15:40','{\"status\": \"PENDING\"}'),(328,'Login Attempts',58,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-20 23:15:41','{\"status\": \"SUCCESS\"}'),(329,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-20 23:18:35','{\"status\": \"PENDING\"}'),(330,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-20 23:18:37','{\"status\": \"SUCCESS\"}'),(331,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-20 23:44:44','{\"status\": \"PENDING\"}'),(332,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-20 23:44:44','{\"status\": \"PENDING\"}'),(333,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-20 23:44:47','{\"status\": \"SUCCESS\"}'),(334,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-20 23:44:47','{\"status\": \"SUCCESS\"}'),(335,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:17:00','{\"status\": \"PENDING\"}'),(336,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 00:17:03','{\"status\": \"SUCCESS\"}'),(337,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:21:23','{\"status\": \"PENDING\"}'),(338,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 00:21:25','{\"status\": \"SUCCESS\"}'),(339,'Login Attempts',58,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 00:42:10','{\"status\": \"PENDING\"}'),(340,'Login Attempts',58,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 00:42:12','{\"status\": \"SUCCESS\"}'),(341,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:43:34','{\"status\": \"PENDING\"}'),(342,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:43:34','{\"status\": \"PENDING\"}'),(343,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 00:43:36','{\"status\": \"SUCCESS\"}'),(344,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-21 00:43:36','{\"status\": \"SUCCESS\"}'),(345,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:43:55','{\"status\": \"PENDING\"}'),(346,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 00:43:57','{\"status\": \"SUCCESS\"}'),(347,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 00:44:07','{\"status\": \"PENDING\"}'),(348,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 00:44:09','{\"status\": \"SUCCESS\"}'),(349,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:47:10','{\"status\": \"PENDING\"}'),(350,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:47:10','{\"status\": \"PENDING\"}'),(351,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:47:11','{\"status\": \"PENDING\"}'),(352,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:47:11','{\"status\": \"PENDING\"}'),(353,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:47:11','{\"status\": \"PENDING\"}'),(354,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:47:11','{\"status\": \"PENDING\"}'),(355,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:47:11','{\"status\": \"PENDING\"}'),(356,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:47:11','{\"status\": \"PENDING\"}'),(357,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:47:57','{\"status\": \"PENDING\"}'),(358,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:47:57','{\"status\": \"PENDING\"}'),(359,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:48:55','{\"status\": \"PENDING\"}'),(360,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:48:55','{\"status\": \"PENDING\"}'),(361,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:48:55','{\"status\": \"PENDING\"}'),(362,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:48:55','{\"status\": \"PENDING\"}'),(363,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:48:55','{\"status\": \"PENDING\"}'),(364,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:48:55','{\"status\": \"PENDING\"}'),(365,'Password Changes',1,'Driver',1,'Password reset requested','2025-04-21 00:48:59','{\"email\": \"dhlittl@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(366,'Password Changes',1,'Driver',2,'Password reset requested','2025-04-21 00:48:59','{\"email\": \"dhlittl@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(367,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:49:49','{\"status\": \"PENDING\"}'),(368,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:49:49','{\"status\": \"PENDING\"}'),(369,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 00:49:51','{\"status\": \"SUCCESS\"}'),(370,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-21 00:49:51','{\"status\": \"SUCCESS\"}'),(371,'Password Changes',1,'Driver',1,'Password reset requested','2025-04-21 00:50:09','{\"email\": \"dhlittl@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(372,'Password Changes',1,'Driver',2,'Password reset requested','2025-04-21 00:50:09','{\"email\": \"dhlittl@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(373,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 00:50:50','{\"status\": \"PENDING\"}'),(374,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 00:50:50','{\"status\": \"PENDING\"}'),(375,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 00:50:52','{\"status\": \"SUCCESS\"}'),(376,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-21 00:50:52','{\"status\": \"SUCCESS\"}'),(377,'Login Attempts',58,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 00:55:01','{\"status\": \"PENDING\"}'),(378,'Login Attempts',58,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 00:55:02','{\"status\": \"SUCCESS\"}'),(379,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:00:07','{\"status\": \"PENDING\"}'),(380,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:00:07','{\"status\": \"PENDING\"}'),(381,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:00:07','{\"status\": \"PENDING\"}'),(382,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:00:07','{\"status\": \"PENDING\"}'),(383,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:00:20','{\"status\": \"PENDING\"}'),(384,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:00:20','{\"status\": \"PENDING\"}'),(385,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:00:21','{\"status\": \"SUCCESS\"}'),(386,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-21 01:00:21','{\"status\": \"SUCCESS\"}'),(387,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:01:36','{\"status\": \"PENDING\"}'),(388,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:01:36','{\"status\": \"PENDING\"}'),(389,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:01:38','{\"status\": \"SUCCESS\"}'),(390,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-21 01:01:38','{\"status\": \"SUCCESS\"}'),(391,'Password Changes',1,'Driver',1,'Password reset requested','2025-04-21 01:02:13','{\"email\": \"dhlittl@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(392,'Password Changes',1,'Driver',2,'Password reset requested','2025-04-21 01:02:13','{\"email\": \"dhlittl@clemson.edu\", \"clientId\": \"5j4209itmgirmnco0nun18heen\"}'),(393,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:02:57','{\"status\": \"PENDING\"}'),(394,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:02:57','{\"status\": \"PENDING\"}'),(395,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:02:58','{\"status\": \"SUCCESS\"}'),(396,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-21 01:02:58','{\"status\": \"SUCCESS\"}'),(397,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:03:31','{\"status\": \"PENDING\"}'),(398,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:03:31','{\"status\": \"PENDING\"}'),(399,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:03:32','{\"status\": \"SUCCESS\"}'),(400,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-21 01:03:32','{\"status\": \"SUCCESS\"}'),(401,'Login Attempts',88,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:07:23','{\"status\": \"PENDING\"}'),(402,'Login Attempts',88,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:07:25','{\"status\": \"SUCCESS\"}'),(403,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:07:53','{\"status\": \"PENDING\"}'),(404,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:07:55','{\"status\": \"SUCCESS\"}'),(405,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:08:14','{\"status\": \"PENDING\"}'),(406,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:08:15','{\"status\": \"SUCCESS\"}'),(407,'Login Attempts',88,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:08:16','{\"status\": \"PENDING\"}'),(408,'Login Attempts',88,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:08:18','{\"status\": \"SUCCESS\"}'),(409,'Driver Applications',88,'Driver',1,'Received submission','2025-04-21 01:09:25','{\"Email\": \"davelittle789@gmail.com\", \"FName\": \"Demo\", \"LName\": \"Test Driver\", \"Submitted_At\": \"2025-04-21 01:09:25.000000\", \"Application_ID\": 46}'),(410,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:09:41','{\"status\": \"PENDING\"}'),(411,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:09:43','{\"status\": \"SUCCESS\"}'),(412,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:10:20','{\"status\": \"PENDING\"}'),(413,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:10:22','{\"status\": \"SUCCESS\"}'),(414,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:11:22','{\"status\": \"PENDING\"}'),(415,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:11:22','{\"status\": \"PENDING\"}'),(416,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:11:22','{\"status\": \"PENDING\"}'),(417,'Driver Applications',88,'Driver',1,'Approved','2025-04-21 01:11:22','{\"Email\": \"davelittle789@gmail.com\", \"FName\": \"Demo\", \"LName\": \"Test Driver\", \"Submitted_At\": \"2025-04-21 01:09:25.000000\", \"Application_ID\": 46}'),(418,'Driver Applications',88,'Driver',1,'Approved','2025-04-21 01:11:22','{\"Email\": \"davelittle789@gmail.com\", \"FName\": \"Demo\", \"LName\": \"Test Driver\", \"Submitted_At\": \"2025-04-21 01:09:25.000000\", \"Application_ID\": 46}'),(419,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:11:23','{\"status\": \"PENDING\"}'),(420,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:11:24','{\"status\": \"SUCCESS\"}'),(421,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:13:34','{\"status\": \"PENDING\"}'),(422,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:13:36','{\"status\": \"SUCCESS\"}'),(423,'Login Attempts',88,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:16:13','{\"status\": \"PENDING\"}'),(424,'Login Attempts',88,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:16:15','{\"status\": \"SUCCESS\"}'),(425,'Login Attempts',59,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:18:22','{\"status\": \"PENDING\"}'),(426,'Login Attempts',59,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:18:23','{\"status\": \"SUCCESS\"}'),(427,'Login Attempts',61,'Sponsor',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:19:19','{\"status\": \"PENDING\"}'),(428,'Login Attempts',61,'Sponsor',2,'Login successful via Cognito (PostAuth)','2025-04-21 01:19:20','{\"status\": \"SUCCESS\"}'),(429,'Login Attempts',88,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:20:06','{\"status\": \"PENDING\"}'),(430,'Login Attempts',88,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:20:08','{\"status\": \"SUCCESS\"}'),(431,'Driver Applications',88,'Driver',2,'Received submission','2025-04-21 01:20:51','{\"Email\": \"davelittle789@gmail.com\", \"FName\": \"Demo\", \"LName\": \"Test Driver\", \"Submitted_At\": \"2025-04-21 01:20:51.000000\", \"Application_ID\": 47}'),(432,'Login Attempts',61,'Sponsor',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:21:08','{\"status\": \"PENDING\"}'),(433,'Login Attempts',61,'Sponsor',2,'Login successful via Cognito (PostAuth)','2025-04-21 01:21:10','{\"status\": \"SUCCESS\"}'),(434,'Driver Applications',88,'Driver',2,'Approved','2025-04-21 01:23:12','{\"Email\": \"davelittle789@gmail.com\", \"FName\": \"Demo\", \"LName\": \"Test Driver\", \"Submitted_At\": \"2025-04-21 01:20:51.000000\", \"Application_ID\": 47}'),(435,'Driver Applications',88,'Driver',2,'Approved','2025-04-21 01:23:12','{\"Email\": \"davelittle789@gmail.com\", \"FName\": \"Demo\", \"LName\": \"Test Driver\", \"Submitted_At\": \"2025-04-21 01:20:51.000000\", \"Application_ID\": 47}'),(436,'Login Attempts',88,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:24:38','{\"status\": \"PENDING\"}'),(437,'Login Attempts',88,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:24:38','{\"status\": \"PENDING\"}'),(438,'Login Attempts',88,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:24:40','{\"status\": \"SUCCESS\"}'),(439,'Login Attempts',88,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-21 01:24:40','{\"status\": \"SUCCESS\"}'),(440,'Driver Applications',88,'Driver',3,'Received submission','2025-04-21 01:24:54','{\"Email\": \"davelittle789@gmail.com\", \"FName\": \"Demo\", \"LName\": \"Test Driver\", \"Submitted_At\": \"2025-04-21 01:24:54.000000\", \"Application_ID\": 48}'),(441,'Login Attempts',62,'Sponsor',3,'Login attempt via Cognito (PreAuth)','2025-04-21 01:25:10','{\"status\": \"PENDING\"}'),(442,'Login Attempts',62,'Sponsor',3,'Login successful via Cognito (PostAuth)','2025-04-21 01:25:11','{\"status\": \"SUCCESS\"}'),(443,'Driver Applications',88,'Driver',3,'Approved','2025-04-21 01:25:22','{\"Email\": \"davelittle789@gmail.com\", \"FName\": \"Demo\", \"LName\": \"Test Driver\", \"Submitted_At\": \"2025-04-21 01:24:54.000000\", \"Application_ID\": 48}'),(444,'Driver Applications',88,'Driver',3,'Approved','2025-04-21 01:25:22','{\"Email\": \"davelittle789@gmail.com\", \"FName\": \"Demo\", \"LName\": \"Test Driver\", \"Submitted_At\": \"2025-04-21 01:24:54.000000\", \"Application_ID\": 48}'),(445,'Login Attempts',88,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:25:51','{\"status\": \"PENDING\"}'),(446,'Login Attempts',88,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:25:51','{\"status\": \"PENDING\"}'),(447,'Login Attempts',88,'Driver',3,'Login attempt via Cognito (PreAuth)','2025-04-21 01:25:51','{\"status\": \"PENDING\"}'),(448,'Login Attempts',88,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:25:53','{\"status\": \"SUCCESS\"}'),(449,'Login Attempts',88,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-21 01:25:53','{\"status\": \"SUCCESS\"}'),(450,'Login Attempts',88,'Driver',3,'Login successful via Cognito (PostAuth)','2025-04-21 01:25:53','{\"status\": \"SUCCESS\"}'),(451,'Login Attempts',89,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:30:04','{\"status\": \"PENDING\"}'),(452,'Login Attempts',89,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:30:06','{\"status\": \"SUCCESS\"}'),(453,'Login Attempts',89,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:32:33','{\"status\": \"PENDING\"}'),(454,'Login Attempts',89,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:32:35','{\"status\": \"SUCCESS\"}'),(455,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:34:18','{\"status\": \"PENDING\"}'),(456,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:34:18','{\"status\": \"PENDING\"}'),(457,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:34:19','{\"status\": \"PENDING\"}'),(458,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:34:37','{\"status\": \"SUCCESS\"}'),(459,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:34:37','{\"status\": \"SUCCESS\"}'),(460,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:34:37','{\"status\": \"SUCCESS\"}'),(461,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:34:37','{\"status\": \"SUCCESS\"}'),(462,'Login Attempts',91,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:37:35','{\"status\": \"PENDING\"}'),(463,'Login Attempts',91,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:37:37','{\"status\": \"SUCCESS\"}'),(464,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:38:24','{\"status\": \"PENDING\"}'),(465,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:38:25','{\"status\": \"SUCCESS\"}'),(466,'Login Attempts',92,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:39:35','{\"status\": \"PENDING\"}'),(467,'Login Attempts',92,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:39:37','{\"status\": \"SUCCESS\"}'),(468,'Login Attempts',57,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:40:51','{\"status\": \"PENDING\"}'),(469,'Login Attempts',57,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:40:52','{\"status\": \"SUCCESS\"}'),(470,'Login Attempts',93,'Sponsor',NULL,'Login attempt via Cognito (PreAuth)','2025-04-21 01:41:54','{\"status\": \"PENDING\"}'),(471,'Login Attempts',93,'Sponsor',NULL,'Login successful via Cognito (PostAuth)','2025-04-21 01:41:55','{\"status\": \"SUCCESS\"}'),(472,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:42:36','{\"status\": \"PENDING\"}'),(473,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:42:36','{\"status\": \"PENDING\"}'),(474,'Login Attempts',1,'Driver',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:42:45','{\"status\": \"PENDING\"}'),(475,'Login Attempts',1,'Driver',2,'Login attempt via Cognito (PreAuth)','2025-04-21 01:42:45','{\"status\": \"PENDING\"}'),(476,'Login Attempts',1,'Driver',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:42:47','{\"status\": \"SUCCESS\"}'),(477,'Login Attempts',1,'Driver',2,'Login successful via Cognito (PostAuth)','2025-04-21 01:42:47','{\"status\": \"SUCCESS\"}'),(478,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:52:11','{\"status\": \"PENDING\"}'),(479,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:52:11','{\"status\": \"PENDING\"}'),(480,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 01:52:12','{\"status\": \"PENDING\"}'),(481,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 01:52:14','{\"status\": \"SUCCESS\"}'),(482,'Point Changes',64,'Sponsor',1,'ADD','2025-04-21 02:00:53','{\"Reason\": \"Good boy\"}'),(483,'Point Changes',63,'Sponsor',1,'ADD','2025-04-21 02:00:59','{\"Reason\": \"Good boy\"}'),(484,'Point Changes',65,'Sponsor',1,'ADD','2025-04-21 02:01:03','{\"Reason\": \"Good boy\"}'),(485,'Login Attempts',2,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 02:05:28','{\"status\": \"PENDING\"}'),(486,'Login Attempts',2,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 02:05:31','{\"status\": \"SUCCESS\"}'),(487,'Login Attempts',95,'Sponsor',1,'Login attempt via Cognito (PreAuth)','2025-04-21 02:09:30','{\"status\": \"PENDING\"}'),(488,'Login Attempts',95,'Sponsor',1,'Login successful via Cognito (PostAuth)','2025-04-21 02:09:31','{\"status\": \"SUCCESS\"}');
/*!40000 ALTER TABLE `Audit_Log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Default_User_Preferences`
--

DROP TABLE IF EXISTS `Default_User_Preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Default_User_Preferences` (
  `User_ID` int NOT NULL,
  `Widget_Order` json NOT NULL,
  PRIMARY KEY (`User_ID`),
  CONSTRAINT `Default_User_Preferences_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Default_User_Preferences`
--

LOCK TABLES `Default_User_Preferences` WRITE;
/*!40000 ALTER TABLE `Default_User_Preferences` DISABLE KEYS */;
/*!40000 ALTER TABLE `Default_User_Preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Driver`
--

DROP TABLE IF EXISTS `Driver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Driver` (
  `Driver_ID` int NOT NULL,
  `User_ID` int DEFAULT NULL,
  PRIMARY KEY (`Driver_ID`),
  KEY `fk_driver_user` (`User_ID`),
  CONSTRAINT `fk_driver_user` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Driver`
--

LOCK TABLES `Driver` WRITE;
/*!40000 ALTER TABLE `Driver` DISABLE KEYS */;
INSERT INTO `Driver` VALUES (1,1),(63,63),(64,64),(65,65),(66,66),(0,76),(77,77),(78,78),(88,88);
/*!40000 ALTER TABLE `Driver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Driver_Applications`
--

DROP TABLE IF EXISTS `Driver_Applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Driver_Applications` (
  `Application_ID` int NOT NULL AUTO_INCREMENT,
  `Sponsor_Org_ID` int DEFAULT NULL,
  `FName` varchar(100) NOT NULL,
  `LName` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Phone` varchar(20) NOT NULL,
  `App_Status` enum('Pending','Approved','Denied') DEFAULT 'Pending',
  `Submitted_At` datetime DEFAULT CURRENT_TIMESTAMP,
  `Processed_At` datetime DEFAULT NULL,
  `Q1_Ans` varchar(1000) DEFAULT NULL,
  `Q2_Ans` varchar(1000) DEFAULT NULL,
  `Q3_Ans` varchar(1000) DEFAULT NULL,
  `All_Policies_Agreed` tinyint(1) NOT NULL DEFAULT '0',
  `User_ID` int NOT NULL,
  PRIMARY KEY (`Application_ID`),
  KEY `Sponsor_Org_ID` (`Sponsor_Org_ID`),
  KEY `Driver_Applications_ibfk_3` (`User_ID`),
  CONSTRAINT `Driver_Applications_ibfk_2` FOREIGN KEY (`Sponsor_Org_ID`) REFERENCES `Sponsor_Organization` (`Sponsor_Org_ID`),
  CONSTRAINT `Driver_Applications_ibfk_3` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Driver_Applications`
--

LOCK TABLES `Driver_Applications` WRITE;
/*!40000 ALTER TABLE `Driver_Applications` DISABLE KEYS */;
INSERT INTO `Driver_Applications` VALUES (4,1,'Marcelo','Diaz','mdiazdu@clemson.edu','5709808357','Approved','2025-04-10 16:38:39','2025-04-10 16:39:33',NULL,NULL,NULL,1,2),(31,1,'John','Doe','johndoe@fake.com','2222222222','Denied','2025-04-19 22:45:31','2025-04-19 23:17:58',NULL,NULL,NULL,1,63),(32,1,'John','Doe','johndoe@fake.com','2222222222','Approved','2025-04-19 23:19:54','2025-04-19 23:37:06',NULL,NULL,NULL,1,63),(33,2,'John','Doe','johndoe@fake.com','2222222222','Approved','2025-04-19 23:20:04','2025-04-19 23:51:31',NULL,NULL,NULL,1,63),(34,3,'John','Doe','johndoe@fake.com','2222222222','Approved','2025-04-19 23:20:12','2025-04-20 00:44:49',NULL,NULL,NULL,1,63),(35,1,'George','Washington','driver@fake.com','1234567890','Approved','2025-04-20 00:57:32','2025-04-20 00:58:49',NULL,NULL,NULL,1,64),(36,2,'George','Washington','driver@fake.com','1234567890','Pending','2025-04-20 00:57:48',NULL,NULL,NULL,NULL,1,64),(37,3,'George','Washington','driver@fake.com','1234567890','Pending','2025-04-20 00:58:08',NULL,NULL,NULL,NULL,1,64),(38,1,'Maggie','Smith','driver@fake.com','1234567890','Approved','2025-04-20 01:36:32','2025-04-20 02:34:39',NULL,NULL,NULL,1,65),(39,1,'Donnie','Darko','ddarko@fake.com','1234567890','Approved','2025-04-20 02:44:02','2025-04-20 02:46:09',NULL,NULL,NULL,1,66),(40,2,'Donnie','Darko','ddarko@fake.com','1234567890','Pending','2025-04-20 02:44:10',NULL,NULL,NULL,NULL,1,66),(41,3,'Steve','Le Puisson','steve@fake.com','1234567890','Approved','2025-04-20 02:52:03','2025-04-20 02:56:34',NULL,NULL,NULL,1,77),(42,2,'Steve','Le Puisson','steve@fake.com','1234567890','Denied','2025-04-20 02:52:17','2025-04-20 02:54:27',NULL,NULL,NULL,1,77),(43,2,'Avery','Carson','avbcarson@gmail.com','0000000000','Denied','2025-04-20 15:46:56','2025-04-20 15:48:36',NULL,NULL,NULL,1,78),(44,2,'Avery','Carson','avbcarson@gmail.com','0000000000','Approved','2025-04-20 15:46:58','2025-04-20 15:49:10',NULL,NULL,NULL,1,78),(45,2,'Martin','Floor','samevins202@gmail.com','9876543221','Pending','2025-04-20 18:06:08',NULL,NULL,NULL,NULL,1,79),(46,1,'Demo','Test Driver','davelittle789@gmail.com','1111111111','Approved','2025-04-21 01:09:25','2025-04-21 01:11:22',NULL,NULL,NULL,1,88),(47,2,'Demo','Test Driver','davelittle789@gmail.com','1111111111','Approved','2025-04-21 01:20:51','2025-04-21 01:23:12',NULL,NULL,NULL,1,88),(48,3,'Demo','Test Driver','davelittle789@gmail.com','1111111111','Approved','2025-04-21 01:24:54','2025-04-21 01:25:22',NULL,NULL,NULL,1,88);
/*!40000 ALTER TABLE `Driver_Applications` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `after_driver_application_insert` AFTER INSERT ON `Driver_Applications` FOR EACH ROW BEGIN
    INSERT INTO Audit_Log (
        Event_Type,
        User_ID,
        Target_Entity,
        Target_ID,
        Action_Description,
        Metadata
    )
    VALUES (
        'Driver Applications',
        NEW.User_ID,
        'Driver',
        NEW.Sponsor_Org_ID,
        'Received submission',
        JSON_OBJECT(
            'Application_ID', NEW.Application_ID,
            'FName', NEW.FName,
            'LName', NEW.LName,
            'Email', NEW.Email,
            'Submitted_At', NEW.Submitted_At
        )
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `after_driver_application_update` AFTER UPDATE ON `Driver_Applications` FOR EACH ROW BEGIN
    IF OLD.App_Status <> NEW.App_Status THEN
        IF NEW.App_Status = 'Approved' THEN
            INSERT INTO Audit_Log (
                Event_Type,
                User_ID,
                Target_Entity,
                Target_ID,
                Action_Description,
                Metadata
            )
            VALUES (
                'Driver Applications',
                NEW.User_ID,
                'Driver',
                NEW.Sponsor_Org_ID,
                'Approved',
                JSON_OBJECT(
                    'Application_ID', NEW.Application_ID,
                    'FName', NEW.FName,
                    'LName', NEW.LName,
                    'Email', NEW.Email,
                    'Submitted_At', NEW.Submitted_At
                )
            );
        ELSEIF NEW.App_Status = 'Denied' THEN
            INSERT INTO Audit_Log (
                Event_Type,
                User_ID,
                Target_Entity,
                Target_ID,
                Action_Description,
                Metadata
            )
            VALUES (
                'Driver Applications', 
                NEW.User_ID,
                'Driver',
                NEW.Sponsor_Org_ID,
                'Denied',
                JSON_OBJECT(
                    'Application_ID', NEW.Application_ID,
                    'FName', NEW.FName,
                    'LName', NEW.LName,
                    'Email', NEW.Email,
                    'Submitted_At', NEW.Submitted_At
                )
            );
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `after_application_approval` AFTER UPDATE ON `Driver_Applications` FOR EACH ROW BEGIN
  IF NEW.App_Status = 'Approved' AND OLD.App_Status != 'Approved' THEN
    CALL AddDriver(NEW.User_ID, NEW.Sponsor_Org_ID);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Driver_Backup`
--

DROP TABLE IF EXISTS `Driver_Backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Driver_Backup` (
  `Driver_ID` int NOT NULL,
  `User_ID` int DEFAULT NULL,
  `Point_Balance` int DEFAULT '0',
  `Num_Purchases` int DEFAULT '0',
  `Point_Goal` int DEFAULT '0',
  `Sponsor_Org_ID` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Driver_Backup`
--

LOCK TABLES `Driver_Backup` WRITE;
/*!40000 ALTER TABLE `Driver_Backup` DISABLE KEYS */;
INSERT INTO `Driver_Backup` VALUES (0,4,801,1,0,1),(1,1,-16776,17,1000,1),(2,6,0,0,0,1),(3,10,0,0,0,1),(4,13,0,0,0,1),(5,15,0,0,0,1),(6,16,0,0,0,1),(7,14,0,0,0,1);
/*!40000 ALTER TABLE `Driver_Backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Driver_Notification_Preferences`
--

DROP TABLE IF EXISTS `Driver_Notification_Preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Driver_Notification_Preferences` (
  `Driver_ID` int NOT NULL,
  `Points_Update_Notifications` tinyint(1) DEFAULT '1',
  `Order_Status_Notifications` tinyint(1) DEFAULT '1',
  `Order_Problem_Notifications` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`Driver_ID`),
  CONSTRAINT `fk_notification_driver` FOREIGN KEY (`Driver_ID`) REFERENCES `Driver` (`Driver_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Driver_Notification_Preferences`
--

LOCK TABLES `Driver_Notification_Preferences` WRITE;
/*!40000 ALTER TABLE `Driver_Notification_Preferences` DISABLE KEYS */;
INSERT INTO `Driver_Notification_Preferences` VALUES (1,0,0,0),(63,1,1,1),(64,1,1,1),(65,1,1,1),(78,1,1,1);
/*!40000 ALTER TABLE `Driver_Notification_Preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Driver_Policy_Agreements`
--

DROP TABLE IF EXISTS `Driver_Policy_Agreements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Driver_Policy_Agreements` (
  `Agreement_ID` int NOT NULL AUTO_INCREMENT,
  `Application_ID` int NOT NULL,
  `Sponsor_Org_ID` int NOT NULL,
  `Agreed_Policies` varchar(1000) NOT NULL,
  `All_Policies_Agreed` tinyint(1) NOT NULL DEFAULT '0',
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Agreement_ID`),
  KEY `Application_ID` (`Application_ID`),
  KEY `Sponsor_Org_ID` (`Sponsor_Org_ID`),
  CONSTRAINT `Driver_Policy_Agreements_ibfk_1` FOREIGN KEY (`Application_ID`) REFERENCES `Driver_Applications` (`Application_ID`),
  CONSTRAINT `Driver_Policy_Agreements_ibfk_2` FOREIGN KEY (`Sponsor_Org_ID`) REFERENCES `Sponsor_Organization` (`Sponsor_Org_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Driver_Policy_Agreements`
--

LOCK TABLES `Driver_Policy_Agreements` WRITE;
/*!40000 ALTER TABLE `Driver_Policy_Agreements` DISABLE KEYS */;
/*!40000 ALTER TABLE `Driver_Policy_Agreements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Driver_Preferences`
--

DROP TABLE IF EXISTS `Driver_Preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Driver_Preferences` (
  `User_ID` int NOT NULL,
  `Widget_Order` json NOT NULL,
  PRIMARY KEY (`User_ID`),
  CONSTRAINT `Driver_Preferences_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Driver_Preferences`
--

LOCK TABLES `Driver_Preferences` WRITE;
/*!40000 ALTER TABLE `Driver_Preferences` DISABLE KEYS */;
INSERT INTO `Driver_Preferences` VALUES (1,'[\"sponsors\", \"points\", \"conversion\", \"catalog\", \"help\", \"apply\", \"sponsorInfo\"]'),(61,'[\"sponsors\", \"points\", \"conversion\", \"catalog\", \"help\", \"apply\", \"sponsorInfo\"]');
/*!40000 ALTER TABLE `Driver_Preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Driver_To_SponsorOrg`
--

DROP TABLE IF EXISTS `Driver_To_SponsorOrg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Driver_To_SponsorOrg` (
  `Driver_ID` int NOT NULL,
  `Sponsor_Org_ID` int NOT NULL,
  `Point_Balance` int DEFAULT '0',
  PRIMARY KEY (`Driver_ID`,`Sponsor_Org_ID`),
  KEY `Sponsor_Org_ID` (`Sponsor_Org_ID`),
  KEY `idx_driver_sponsor` (`Driver_ID`,`Sponsor_Org_ID`),
  CONSTRAINT `Driver_To_SponsorOrg_ibfk_2` FOREIGN KEY (`Sponsor_Org_ID`) REFERENCES `Sponsor_Organization` (`Sponsor_Org_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Driver_To_SponsorOrg`
--

LOCK TABLES `Driver_To_SponsorOrg` WRITE;
/*!40000 ALTER TABLE `Driver_To_SponsorOrg` DISABLE KEYS */;
INSERT INTO `Driver_To_SponsorOrg` VALUES (0,1,0),(1,1,515),(1,2,242),(60,1,0),(63,1,140),(63,2,0),(63,3,0),(64,1,140),(65,1,20),(66,1,0),(77,3,0),(78,2,271),(88,1,0),(88,2,0),(88,3,0);
/*!40000 ALTER TABLE `Driver_To_SponsorOrg` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `after_point_update` AFTER UPDATE ON `Driver_To_SponsorOrg` FOR EACH ROW BEGIN
    -- Only trigger if point balance changed
    IF NEW.Point_Balance != OLD.Point_Balance THEN
        -- Insert a notification record
        INSERT INTO PointNotifications (
            Driver_ID, 
            User_ID,
            Sponsor_Org_ID,
            Old_Balance,
            New_Balance,
            Notification_Sent,
            Created_At
        ) 
        SELECT 
            NEW.Driver_ID,
            d.User_ID,
            NEW.Sponsor_Org_ID,
            OLD.Point_Balance,
            NEW.Point_Balance,
            FALSE,
            NOW()
        FROM Driver d
        WHERE d.Driver_ID = NEW.Driver_ID;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Invoice`
--

DROP TABLE IF EXISTS `Invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Invoice` (
  `Inv_ID` int NOT NULL AUTO_INCREMENT,
  `Sponsor_Org_ID` int DEFAULT NULL,
  `User_ID` int DEFAULT NULL,
  `Date_Issued` date DEFAULT NULL,
  `Total_Amount_Points` int DEFAULT NULL,
  `Total_Amount_Dol` decimal(10,2) DEFAULT NULL,
  `Product_ID` int DEFAULT NULL,
  `Quantity` int DEFAULT NULL,
  `Payment_Status` varchar(50) DEFAULT NULL,
  `Created_At` datetime DEFAULT CURRENT_TIMESTAMP,
  `Updated_At` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Inv_ID`),
  KEY `Sponsor_Org_ID` (`Sponsor_Org_ID`),
  KEY `User_ID` (`User_ID`),
  KEY `Product_ID` (`Product_ID`),
  CONSTRAINT `Invoice_ibfk_1` FOREIGN KEY (`Sponsor_Org_ID`) REFERENCES `Sponsor_Organization` (`Sponsor_Org_ID`),
  CONSTRAINT `Invoice_ibfk_2` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE,
  CONSTRAINT `Invoice_ibfk_3` FOREIGN KEY (`Product_ID`) REFERENCES `Product` (`Product_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Invoice`
--

LOCK TABLES `Invoice` WRITE;
/*!40000 ALTER TABLE `Invoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `Invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Login_Attempts`
--

DROP TABLE IF EXISTS `Login_Attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Login_Attempts` (
  `Attempt_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int DEFAULT NULL,
  `Succeeded` tinyint(1) DEFAULT NULL,
  `Login_Time` datetime DEFAULT NULL,
  PRIMARY KEY (`Attempt_ID`),
  KEY `User_ID` (`User_ID`),
  CONSTRAINT `Login_Attempts_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Login_Attempts`
--

LOCK TABLES `Login_Attempts` WRITE;
/*!40000 ALTER TABLE `Login_Attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `Login_Attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Password_Changes`
--

DROP TABLE IF EXISTS `Password_Changes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Password_Changes` (
  `Change_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int DEFAULT NULL,
  `Change_Date` datetime DEFAULT NULL,
  PRIMARY KEY (`Change_ID`),
  KEY `User_ID` (`User_ID`),
  CONSTRAINT `Password_Changes_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Password_Changes`
--

LOCK TABLES `Password_Changes` WRITE;
/*!40000 ALTER TABLE `Password_Changes` DISABLE KEYS */;
/*!40000 ALTER TABLE `Password_Changes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PointNotifications`
--

DROP TABLE IF EXISTS `PointNotifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PointNotifications` (
  `Notification_ID` int NOT NULL AUTO_INCREMENT,
  `Driver_ID` int NOT NULL,
  `User_ID` int NOT NULL,
  `Sponsor_Org_ID` int NOT NULL,
  `Old_Balance` int NOT NULL,
  `New_Balance` int NOT NULL,
  `Notification_Sent` tinyint(1) DEFAULT '0',
  `Created_At` datetime NOT NULL,
  `Processed_At` datetime DEFAULT NULL,
  PRIMARY KEY (`Notification_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PointNotifications`
--

LOCK TABLES `PointNotifications` WRITE;
/*!40000 ALTER TABLE `PointNotifications` DISABLE KEYS */;
INSERT INTO `PointNotifications` VALUES (1,1,1,1,1100,1125,0,'2025-04-17 17:25:51',NULL),(2,1,1,1,1125,1150,0,'2025-04-17 19:01:59',NULL),(3,1,1,1,1150,1175,0,'2025-04-17 19:03:48',NULL),(4,1,1,1,1175,1076,0,'2025-04-17 19:47:36',NULL),(5,1,1,1,1076,977,0,'2025-04-17 19:47:38',NULL),(6,1,1,1,977,878,0,'2025-04-17 19:47:39',NULL),(7,1,1,1,878,903,0,'2025-04-17 19:53:56',NULL),(8,1,1,1,903,1224,0,'2025-04-17 19:58:06',NULL),(9,1,1,1,1224,-776,0,'2025-04-17 19:59:00',NULL),(10,1,1,1,-776,-2776,0,'2025-04-17 19:59:02',NULL),(11,1,1,1,-2776,-4776,0,'2025-04-17 19:59:02',NULL),(12,1,1,1,-4776,-6776,0,'2025-04-17 19:59:03',NULL),(13,1,1,1,-6776,-8776,0,'2025-04-17 19:59:03',NULL),(14,1,1,1,-8776,-10776,0,'2025-04-17 19:59:03',NULL),(15,1,1,1,-10776,-12776,0,'2025-04-17 19:59:03',NULL),(16,1,1,1,-12776,-14776,0,'2025-04-17 19:59:03',NULL),(17,1,1,1,-14776,-16776,0,'2025-04-17 19:59:04',NULL),(18,0,4,1,401,501,0,'2025-04-18 22:58:45',NULL),(19,0,4,1,501,601,0,'2025-04-18 22:58:49',NULL),(20,0,4,1,601,701,0,'2025-04-18 23:07:52',NULL),(21,0,4,1,701,801,0,'2025-04-18 23:07:58',NULL),(22,0,4,1,801,701,0,'2025-04-19 00:26:37',NULL),(23,0,4,1,701,601,0,'2025-04-19 00:26:41',NULL),(24,0,4,1,601,701,0,'2025-04-19 00:27:23',NULL),(25,0,4,1,701,801,0,'2025-04-19 00:27:24',NULL),(26,1,1,1,-16776,1000,0,'2025-04-19 02:47:25',NULL),(27,1,1,2,0,500,0,'2025-04-19 02:53:42',NULL),(29,1,1,1,1000,901,0,'2025-04-19 23:05:20',NULL),(30,1,1,1,901,-11624,0,'2025-04-20 00:42:49',NULL),(31,1,1,2,500,200,0,'2025-04-20 00:44:30',NULL),(32,1,1,1,-11624,0,0,'2025-04-20 00:55:30',NULL),(33,1,1,1,0,1000,0,'2025-04-20 00:56:30',NULL),(34,1,1,1,1000,901,0,'2025-04-20 01:55:49',NULL),(35,1,1,2,200,71,0,'2025-04-20 02:23:08',NULL),(37,1,1,2,71,371,0,'2025-04-20 03:02:22',NULL),(38,78,78,2,0,100,0,'2025-04-20 15:56:30',NULL),(39,78,78,2,100,400,0,'2025-04-20 15:58:06',NULL),(40,78,78,2,400,271,0,'2025-04-20 16:11:40',NULL),(41,1,1,2,371,242,0,'2025-04-20 16:27:28',NULL),(42,1,1,1,901,574,0,'2025-04-20 16:34:32',NULL),(43,1,1,1,574,494,0,'2025-04-20 17:45:40',NULL),(44,1,1,1,494,395,0,'2025-04-20 18:20:11',NULL),(45,1,1,1,395,495,0,'2025-04-20 19:12:11',NULL),(46,1,1,1,495,395,0,'2025-04-20 19:14:04',NULL),(47,1,1,1,395,415,0,'2025-04-20 19:33:11',NULL),(48,63,63,1,0,20,0,'2025-04-20 19:33:18',NULL),(49,64,64,1,0,20,0,'2025-04-20 19:33:21',NULL),(50,1,1,1,415,465,0,'2025-04-20 19:35:00',NULL),(51,63,63,1,20,70,0,'2025-04-20 19:35:06',NULL),(52,64,64,1,20,70,0,'2025-04-20 19:35:10',NULL),(53,1,1,1,465,515,0,'2025-04-20 19:54:24',NULL),(54,63,63,1,70,120,0,'2025-04-20 19:54:31',NULL),(55,64,64,1,70,120,0,'2025-04-20 19:54:34',NULL),(56,64,64,1,120,140,0,'2025-04-21 02:00:53',NULL),(57,63,63,1,120,140,0,'2025-04-21 02:00:59',NULL),(58,65,65,1,0,20,0,'2025-04-21 02:01:03',NULL);
/*!40000 ALTER TABLE `PointNotifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Point_Changes`
--

DROP TABLE IF EXISTS `Point_Changes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Point_Changes` (
  `Points_Change_ID` int NOT NULL AUTO_INCREMENT,
  `Driver_ID` int DEFAULT NULL,
  `Sponsor_User_ID` int DEFAULT NULL,
  `Num_Points` int DEFAULT NULL,
  `Point_Change_Type` varchar(4) DEFAULT NULL,
  `Reason` varchar(255) DEFAULT NULL,
  `Change_Date` datetime DEFAULT NULL,
  `Sponsor_Org_ID` int NOT NULL,
  `Exp_Date` datetime DEFAULT NULL,
  PRIMARY KEY (`Points_Change_ID`),
  KEY `Driver_ID` (`Driver_ID`),
  KEY `Sponsor_User_ID` (`Sponsor_User_ID`),
  KEY `fk_pointchanges_driver` (`Sponsor_Org_ID`,`Driver_ID`),
  CONSTRAINT `Point_Changes_ibfk_2` FOREIGN KEY (`Sponsor_User_ID`) REFERENCES `Sponsor_User` (`Sponsor_User_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Point_Changes`
--

LOCK TABLES `Point_Changes` WRITE;
/*!40000 ALTER TABLE `Point_Changes` DISABLE KEYS */;
INSERT INTO `Point_Changes` VALUES (71,1,NULL,387,'SUB','Product purchase','2025-04-10 08:42:41',1,NULL),(72,1,NULL,387,'SUB','Product purchase','2025-04-10 09:15:38',1,NULL),(73,1,NULL,387,'SUB','Product purchase','2025-04-10 10:58:35',1,NULL),(74,1,NULL,258,'SUB','Product purchase','2025-04-10 10:59:55',1,NULL),(75,1,NULL,129,'SUB','Product purchase','2025-04-10 16:40:12',1,NULL),(76,1,NULL,129,'SUB','Product purchase','2025-04-10 17:23:32',1,NULL),(77,1,NULL,129,'SUB','Product purchase','2025-04-10 17:29:46',1,NULL),(78,1,NULL,129,'SUB','Product purchase','2025-04-10 17:55:31',1,NULL),(79,1,NULL,327,'SUB','Product purchase','2025-04-10 19:44:59',1,NULL),(80,1,NULL,99,'SUB','Product purchase','2025-04-17 05:10:09',1,NULL),(81,1,NULL,99,'SUB','Product purchase','2025-04-17 05:12:44',1,NULL),(82,1,NULL,99,'SUB','Product purchase','2025-04-17 05:14:43',1,NULL),(83,1,NULL,99,'SUB','Product purchase','2025-04-17 05:29:21',1,NULL),(84,1,NULL,99,'SUB','Product purchase','2025-04-17 05:56:16',1,NULL),(87,1,NULL,2000,'ADD','Bonus','2025-04-17 00:00:00',1,NULL),(88,1,NULL,1000,'ADD','Bonus','2025-04-15 00:00:00',1,NULL),(89,1,NULL,100,'ADD','Bonus','2025-04-10 00:00:00',2,NULL),(90,1,1,25,'ADD','Add Points','2025-04-17 17:25:51',1,NULL),(91,1,1,100,'ADD','Birthday Gift!','2025-04-16 00:00:00',2,'2025-09-12 00:00:00'),(92,1,1,25,'ADD','Wow points!','2025-04-17 19:01:59',1,NULL),(93,1,1,25,'ADD','More points!','2025-04-17 19:03:48',1,NULL),(94,1,NULL,99,'SUB','Product purchase','2025-04-17 19:47:36',1,NULL),(95,1,NULL,99,'SUB','Product purchase','2025-04-17 19:47:38',1,NULL),(96,1,NULL,99,'SUB','Product purchase','2025-04-17 19:47:39',1,NULL),(97,1,1,25,'ADD','Poits woohoo','2025-04-17 19:53:56',1,NULL),(98,1,1,321,'ADD','wooo more points','2025-04-17 19:58:06',1,NULL),(99,1,1,-2000,'SUB','got angry','2025-04-17 19:59:00',1,NULL),(100,1,1,-2000,'SUB','got angry','2025-04-17 19:59:02',1,NULL),(101,1,1,-2000,'SUB','got angry','2025-04-17 19:59:02',1,NULL),(102,1,1,-2000,'SUB','got angry','2025-04-17 19:59:03',1,NULL),(103,1,1,-2000,'SUB','got angry','2025-04-17 19:59:03',1,NULL),(104,1,1,-2000,'SUB','got angry','2025-04-17 19:59:03',1,NULL),(105,1,1,-2000,'SUB','got angry','2025-04-17 19:59:03',1,NULL),(106,1,1,-2000,'SUB','got angry','2025-04-17 19:59:03',1,NULL),(107,1,1,-2000,'SUB','got angry','2025-04-17 19:59:04',1,NULL),(119,1,NULL,-99,'SUB','Product purchase','2025-04-19 23:05:20',1,NULL),(120,1,1,11624,'ADD','Set Davis\' points to 0','2025-04-20 00:55:30',1,NULL),(121,1,1,1000,'ADD','Because Davis is the best','2025-04-20 00:56:30',1,NULL),(122,1,NULL,-99,'SUB','Product purchase','2025-04-20 01:55:49',1,NULL),(123,1,NULL,-129,'SUB','Product purchase','2025-04-20 02:23:08',2,NULL),(125,1,3,300,'ADD','He is really cool','2025-04-20 03:02:22',2,NULL),(126,78,3,100,'ADD','Wearing a Seatbelt','2025-04-20 15:56:30',2,NULL),(127,78,3,300,'ADD','Stop at Stop Signs','2025-04-20 15:58:06',2,NULL),(128,78,NULL,-129,'SUB','Product purchase','2025-04-20 16:11:39',2,NULL),(129,1,NULL,-129,'SUB','Product purchase','2025-04-20 16:27:28',2,NULL),(130,1,NULL,-327,'SUB','Product purchase','2025-04-20 16:34:32',1,NULL),(131,1,1,80,'SUB','Did a bad','2025-04-20 17:45:40',1,NULL),(132,1,NULL,-99,'SUB','Product purchase','2025-04-20 18:20:11',1,NULL),(133,1,2,100,'ADD','points test','2025-04-20 19:12:11',1,NULL),(134,1,2,100,'SUB','points test','2025-04-20 19:14:04',1,NULL),(135,1,2,20,'ADD','add points to multiple','2025-04-20 19:33:11',1,NULL),(136,63,2,20,'ADD','add points to multiple','2025-04-20 19:33:18',1,NULL),(137,64,2,20,'ADD','add points to multiple','2025-04-20 19:33:21',1,NULL),(138,1,2,50,'ADD','test','2025-04-20 19:35:01',1,NULL),(139,63,2,50,'ADD','test','2025-04-20 19:35:06',1,NULL),(140,64,2,50,'ADD','test','2025-04-20 19:35:10',1,NULL),(141,1,2,50,'ADD','loading demonstration','2025-04-20 19:54:24',1,NULL),(142,63,2,50,'ADD','loading demonstration','2025-04-20 19:54:31',1,NULL),(143,64,2,50,'ADD','loading demonstration','2025-04-20 19:54:34',1,NULL),(144,64,2,20,'ADD','Good boy','2025-04-21 02:00:53',1,NULL),(145,63,2,20,'ADD','Good boy','2025-04-21 02:00:59',1,NULL),(146,65,2,20,'ADD','Good boy','2025-04-21 02:01:03',1,NULL);
/*!40000 ALTER TABLE `Point_Changes` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `after_point_changes_insert` AFTER INSERT ON `Point_Changes` FOR EACH ROW BEGIN
    DECLARE found_user_id INT;

    SELECT User_ID INTO found_user_id
    FROM Driver
    WHERE Driver_ID = NEW.Driver_ID;

    INSERT INTO Audit_Log (
        Event_Type,
        User_ID,
        Target_Entity,
        Target_ID,
        Action_Description,
        Metadata
    )
    VALUES (
        'Point Changes',
        found_user_id,
        'Sponsor',
        NEW.Sponsor_Org_ID,
        NEW.Point_Change_Type,
        JSON_OBJECT(
            'Reason', NEW.Reason
        )
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Points_Key`
--

DROP TABLE IF EXISTS `Points_Key`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Points_Key` (
  `Reason_ID` int NOT NULL AUTO_INCREMENT,
  `Sponsor_Org_ID` int NOT NULL,
  `Reason` varchar(225) NOT NULL,
  `Points` int NOT NULL,
  `Date_Added` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Reason_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Points_Key`
--

LOCK TABLES `Points_Key` WRITE;
/*!40000 ALTER TABLE `Points_Key` DISABLE KEYS */;
INSERT INTO `Points_Key` VALUES (1,1,'Updated reason description',50,'2025-04-02 20:33:04'),(2,1,'Following the Speed Limit',30,'2025-04-02 20:33:21'),(3,1,'Updated Reason Name',25,'2025-04-02 20:33:33'),(4,1,'Drive Sober',0,'2025-04-02 20:33:44'),(5,1,'Drive without Going on Phone',0,'2025-04-02 20:33:57'),(6,1,'Signal to Change Lanes',0,'2025-04-02 20:34:08'),(7,1,'Signal to Turn',0,'2025-04-02 20:34:19'),(8,1,'Check Blindspots',0,'2025-04-02 20:34:31'),(9,1,'Get Car Maitenance Done',0,'2025-04-02 20:34:43'),(10,1,'Tailgating',0,'2025-04-02 20:36:22'),(11,1,'Speeding',0,'2025-04-02 20:36:32'),(12,1,'Not Wearing Seatbelt',0,'2025-04-02 20:36:46'),(13,1,'Car Crash (at fault)',0,'2025-04-02 20:37:00'),(14,1,'DUI',0,'2025-04-02 20:37:17'),(15,1,'Distracted Driving',0,'2025-04-02 20:37:28'),(16,1,'Reckless Driving',0,'2025-04-02 20:37:38'),(17,1,'Running a Stop Sign',0,'2025-04-02 20:37:49'),(18,1,'Running a Red Light',0,'2025-04-02 20:38:01'),(19,2,'Wearing Your Seatbelt',100,'2025-04-02 20:40:09'),(20,2,'Following the Speed Limit',150,'2025-04-02 20:40:23'),(21,2,'Stop at Stop Signs',300,'2025-04-02 20:40:37'),(22,2,'Drive Sober',50,'2025-04-02 20:40:46'),(23,2,'Drive without Going on Phone',100,'2025-04-02 20:41:13'),(24,2,'Signal to Change Lanes',5,'2025-04-02 20:41:19'),(25,2,'Signal to Turn',50,'2025-04-02 20:41:24'),(26,2,'Check Blindspots',30,'2025-04-02 20:41:29'),(27,2,'Get Car Maitenance Done',8,'2025-04-02 20:41:35'),(28,2,'Tailgating',-200,'2025-04-02 20:41:55'),(29,2,'Speeding',-500,'2025-04-02 20:42:03'),(30,2,'Not Wearing Seatbelt',-10,'2025-04-02 20:42:09'),(31,2,'Car Crash (at fault)',-5000,'2025-04-02 20:42:14'),(32,2,'DUI',-2000,'2025-04-02 20:42:20'),(33,2,'Distracted Driving',-20,'2025-04-02 20:42:25'),(34,2,'Reckless Driving',-300,'2025-04-02 20:42:31'),(35,2,'Running a Stop Sign',-50,'2025-04-02 20:42:37'),(36,2,'Running a Red Light',-10,'2025-04-02 20:42:41'),(37,3,'Wearing Your Seatbelt',20,'2025-04-02 20:43:00'),(38,3,'Following the Speed Limit',0,'2025-04-02 20:43:05'),(39,3,'Stop at Stop Signs',0,'2025-04-02 20:43:12'),(40,3,'Drive Sober',0,'2025-04-02 20:43:20'),(41,3,'Drive without Going on Phone',0,'2025-04-02 20:43:24'),(42,3,'Signal to Change Lanes',0,'2025-04-02 20:43:28'),(43,3,'Signal to Turn',0,'2025-04-02 20:43:31'),(44,3,'Check Blindspots',0,'2025-04-02 20:43:34'),(45,3,'Get Car Maitenance Done',0,'2025-04-02 20:43:38'),(46,3,'Tailgating',0,'2025-04-02 20:44:12'),(47,3,'Speeding',0,'2025-04-02 20:44:20'),(48,3,'Not Wearing Seatbelt',0,'2025-04-02 20:45:10'),(49,3,'Car Crash (at fault)',0,'2025-04-02 20:45:18'),(50,3,'DUI',0,'2025-04-02 20:45:25'),(51,3,'Distracted Driving',0,'2025-04-02 20:45:31'),(52,3,'Reckless Driving',0,'2025-04-02 20:45:37'),(53,3,'Running a Stop Sign',0,'2025-04-02 20:45:42'),(54,3,'Running a Red Light',0,'2025-04-02 20:45:48');
/*!40000 ALTER TABLE `Points_Key` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Product`
--

DROP TABLE IF EXISTS `Product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Product` (
  `Product_ID` int NOT NULL AUTO_INCREMENT,
  `Sponsor_Org_ID` int DEFAULT NULL,
  `Product_Name` varchar(255) DEFAULT NULL,
  `Product_Description` varchar(1000) DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `Quantity` int DEFAULT NULL,
  `Image_URL` varchar(2000) DEFAULT NULL,
  `Created_At` datetime DEFAULT CURRENT_TIMESTAMP,
  `Updated_At` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Product_ID`),
  KEY `Sponsor_Org_ID` (`Sponsor_Org_ID`),
  CONSTRAINT `Product_ibfk_1` FOREIGN KEY (`Sponsor_Org_ID`) REFERENCES `Sponsor_Organization` (`Sponsor_Org_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=567 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Product`
--

LOCK TABLES `Product` WRITE;
/*!40000 ALTER TABLE `Product` DISABLE KEYS */;
INSERT INTO `Product` VALUES (495,1,'Viva la Vida','No description available',0.99,200,'https://is1-ssl.mzstatic.com/image/thumb/Music/10/d1/b7/mzi.anagqfhj.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-20 19:05:03'),(496,1,'Tiger Rag (feat. Tigeroar Alumni)','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-17 15:42:44'),(497,1,'Never Say Never','No description available',1.29,0,'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/67/69/51/676951b1-1a01-66e4-85b6-889821577450/859708655476_cover.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-20 16:34:32'),(498,1,'When a Man Loves a Perfect Woman','No description available',0.99,0,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-19 23:05:20'),(499,1,'Medley: Chicken Fried / Jump Right In / Loving You Easy / Homegrown / Colder Weather / Knee Deep','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-17 15:42:59'),(500,1,'Teenage Mutant Ninja Turtle (Bonus Track)','No description available',0.99,0,'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/cb/27/b3/cb27b3e2-3fa5-8f61-f271-ac54a916ba3d/YzANa.png/100x100bb.jpg','2025-04-10 17:56:45','2025-04-20 16:34:32'),(501,1,'Fix You','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(502,1,'Too Much to Ask','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(503,1,'Waiting For You','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music/9e/ee/e7/mzi.icyywcwb.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(504,1,'How Long','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(505,1,'Too Good at Goodbyes (feat. Clemson University Gospel Choir)','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(506,1,'Unsteady','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(507,1,'Medley: Pusher Love Girl / Cry Me a River / What Goes Around…/…Comes Around / My Love / Mirrors','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(508,1,'Unwell','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/fc/06/47/fc06471d-441c-e12b-080c-de67e1764d71/KCKv8.png/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(509,1,'On the Radio','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/a9/35/11a93517-b152-c7b6-dafd-8b551a144dfa/198001570537.png/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(510,1,'Castle on the Hill','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(511,1,'Can\'t Stop the Feeling','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/dd/51/6e/dd516ec3-5674-1384-3978-dc5c783877e6/888295770217.jpg/100x100bb.jpg','2025-04-10 17:56:45','2025-04-10 17:56:45'),(512,2,'Man In the Mirror','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:58','2025-04-20 01:48:58'),(513,2,'Billie Jean (Single Version)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:58','2025-04-20 01:48:58'),(514,2,'Don\'t Stop \'Til You Get Enough','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:58','2025-04-20 01:48:58'),(515,2,'Shake Your Body (Down to the Ground) [Single Version]','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(516,2,'Human Nature (Single Version)','No description available',1.29,0,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 02:23:08'),(517,2,'Remember the Time','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(518,2,'Blame It On the Boogie','No description available',1.29,0,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 16:11:40'),(519,2,'Dirty Diana','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(520,2,'You Are Not Alone (Single Version)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(521,2,'Bad','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(522,2,'Thriller (2003 Edit)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(523,2,'The Way You Make Me Feel (Single Version)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(524,2,'Black or White','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(525,2,'Smooth Criminal','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(526,2,'Will You Be There (Single Version)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(527,2,'Rock With You (Single Version)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(528,2,'You Rock My World','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(529,2,'P.Y.T. (Pretty Young Thing)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(530,2,'Wanna Be Startin\' Somethin\' (Single Version)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(531,2,'Beat It (Single Version)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/9d/38/3d9d3811-71f0-3a0e-1ada-3004e56ff852/827969428726.jpg/100x100bb.jpg','2025-04-20 01:48:59','2025-04-20 01:48:59'),(532,2,'Our Song','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:40','2025-04-20 16:13:40'),(533,2,'A Perfectly Good Heart','No description available',1.29,0,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:27:28'),(534,2,'Picture to Burn','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(535,2,'Cold As You','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(536,2,'Tim McGraw','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(537,2,'Tied Together With a Smile','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(538,2,'Should\'ve Said No','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(539,2,'The Outside','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(540,2,'Mary\'s Song (Oh My My My)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(541,2,'Teardrops On My Guitar (Radio Single Remix)','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(542,2,'I\'m Only Me When I\'m With You','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(543,2,'Stay Beautiful','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(544,2,'A Place In This World','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(545,2,'Invisible','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(546,2,'Teardrops On My Guitar (Pop Version)','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/32/b5/6b/32b56b49-0075-7128-e6ec-7c3c4c697242/00843930000821.rgb.jpg/100x100bb.jpg','2025-04-20 16:13:41','2025-04-20 16:13:41'),(547,1,'Silver Lining','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:01','2025-04-21 02:15:01'),(548,1,'Mt. Joy','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:01','2025-04-21 02:15:01'),(549,1,'Bathroom Light','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/94/40/3e/94403e5c-75c7-a45d-74a2-034a8dedf3cf/22UMGIM33741.rgb.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(550,1,'I\'m Your Wreck','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(551,1,'Julia','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(552,1,'Lemon Tree','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/94/40/3e/94403e5c-75c7-a45d-74a2-034a8dedf3cf/22UMGIM33741.rgb.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(553,1,'St. George','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(554,1,'I Believe In a Hill Called Mt. Calvary','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music4/v4/b0/f7/8d/b0f78d83-e5d8-9d77-1afe-d3ee294745c8/00789042115957.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(555,1,'Santa Drives An Astrovan','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/20/43/ff/2043ff25-248e-4998-aad6-9c424ce13ea7/198704203725_Cover.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(556,1,'Dirty Love','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(557,1,'Bigfoot','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(558,1,'Cardinal','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(559,1,'Mt. Joy - Live at the Salt Shed, December 2023','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e1/2b/cc/e12bccfa-7e5d-2c43-4193-188788825413/24062.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(560,1,'Jenny Jenkins','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(561,1,'Sheep','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(562,1,'Have You Ever Seen The Rain (feat. Mt. Joy)','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f8/f4/34/f8f4341d-eb4b-6244-0d58-ef2e9cf9c232/193436403146_JesseWellesftMtJoyHYESTROfficialArtwork.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(563,1,'Astrovan','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(564,1,'Younger Days','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(565,1,'Sado','No description available',1.29,1,'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bf/c7/82/bfc782d3-349f-8dcb-ed50-4f65ba5b2e59/18562.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02'),(566,1,'Blown-out Joy From Heaven\'s Mercied Hole','No description available',0.99,1,'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/20/e9/d7/20e9d77f-4ee9-5567-148f-7bc5af4e62a3/mzi.brwjculz.jpg/100x100bb.jpg','2025-04-21 02:15:02','2025-04-21 02:15:02');
/*!40000 ALTER TABLE `Product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Purchase`
--

DROP TABLE IF EXISTS `Purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Purchase` (
  `Purchase_ID` varchar(36) NOT NULL,
  `Driver_ID` int NOT NULL,
  `Sponsor_Org_ID` int NOT NULL,
  `Total_Points` int NOT NULL,
  `Purchase_Date` datetime NOT NULL,
  `Status` varchar(20) DEFAULT 'Completed',
  `Created_At` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Purchase_ID`),
  KEY `idx_driver_id` (`Driver_ID`),
  KEY `idx_sponsor_org_id` (`Sponsor_Org_ID`),
  KEY `fk_purchase_driver` (`Sponsor_Org_ID`,`Driver_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Purchase`
--

LOCK TABLES `Purchase` WRITE;
/*!40000 ALTER TABLE `Purchase` DISABLE KEYS */;
INSERT INTO `Purchase` VALUES ('02c3012d-2faf-4ede-9790-5a9cfea50693',1,1,99,'2025-04-21 02:08:58','Cancelled','2025-04-21 02:08:58'),('09290216-5668-46ae-bf24-50acf2fbd0f1',1,1,327,'2025-04-10 19:44:59','Completed','2025-04-10 19:44:59'),('0f43c2a3-eb2f-4ee9-a0ff-959275d5caa8',1,2,129,'2025-04-21 01:44:16','Cancelled','2025-04-21 01:44:16'),('1258ca74-61a9-4406-b9b1-fe8e04482799',1,1,99,'2025-04-17 05:10:09','Completed','2025-04-17 05:10:09'),('132aacf5-9260-4c9d-9f21-3dbaebcf5d76',1,1,129,'2025-04-10 17:29:46','Completed','2025-04-10 17:29:46'),('22632e31-0c0a-4cac-9926-88f41e1ddeb2',1,2,129,'2025-04-20 17:14:59','Cancelled','2025-04-20 17:14:59'),('254ca080-da1f-48ae-a2a1-15511811fe00',1,2,129,'2025-04-20 16:25:57','Approved','2025-04-20 16:25:57'),('25a25004-0c82-47e2-b11e-6a48dfb235f9',1,1,327,'2025-04-20 16:32:06','Approved','2025-04-20 16:32:06'),('282b094a-65aa-4584-bafa-eaa6fe636ed7',1,1,99,'2025-04-20 18:27:12','Denied','2025-04-20 18:27:12'),('334eb2f2-ee04-483e-8db5-5e3aecb337e5',1,2,129,'2025-04-20 16:28:49','Denied','2025-04-20 16:28:49'),('39ac2245-e542-4e53-b24f-b2ec50609326',1,1,99,'2025-04-20 01:54:34','Approved','2025-04-20 01:54:34'),('3a40bf43-c47b-4ab7-a7d7-d415073ddd08',1,1,99,'2025-04-20 18:57:10','Denied','2025-04-20 18:57:10'),('3aee40e3-47c8-420b-89f2-bc33672c96f0',78,2,129,'2025-04-20 16:05:04','Approved','2025-04-20 16:05:04'),('3e1dd654-6287-4ee7-8d82-d9db9910e9c6',1,2,129,'2025-04-20 17:04:38','Cancelled','2025-04-20 17:04:38'),('43aad0d2-59a7-4212-bc15-caf0190f3314',1,1,99,'2025-04-17 19:47:39','Completed','2025-04-17 19:47:39'),('63d567ed-c081-47a7-a655-1c25e5b12990',1,1,99,'2025-04-17 05:29:21','Completed','2025-04-17 05:29:21'),('6d7b548d-fa80-4f12-bae7-fd7eb4943eb1',1,1,129,'2025-04-10 16:40:12','Completed','2025-04-10 16:40:12'),('70977301-153f-491e-8a45-9fd6fb90b3d1',1,2,516,'2025-04-20 16:12:36','Cancelled','2025-04-20 16:12:36'),('79fafe1e-1ff8-4bd5-a6d9-53f2ea4ef390',1,1,99,'2025-04-20 16:06:24','Cancelled','2025-04-20 16:06:24'),('81adce7c-a7c6-4348-9e8c-8a17dddf3245',1,2,129,'2025-04-20 02:20:51','Approved','2025-04-20 02:20:51'),('824154ad-4838-40bb-9ef9-f499055cc636',1,1,99,'2025-04-17 19:47:36','Completed','2025-04-17 19:47:36'),('824d51d6-3654-41f7-a980-4853c5ca200e',1,1,99,'2025-04-20 18:52:24','Denied','2025-04-20 18:52:24'),('8a7ca5d0-7c82-4b52-a870-a0c89299ab53',1,1,99,'2025-04-19 23:03:22','Approved','2025-04-19 23:03:22'),('8d572f02-7aa2-461a-865c-55db08b958eb',1,2,129,'2025-04-20 01:54:35','Cancelled','2025-04-20 01:54:35'),('8e3c1229-3919-43d6-8f69-13d76554adb4',1,1,99,'2025-04-20 02:20:50','Cancelled','2025-04-20 02:20:50'),('902830be-912a-4503-bd3d-39060cbfaa65',1,1,99,'2025-04-17 05:14:43','Completed','2025-04-17 05:14:43'),('91914614-d912-4609-9e51-40c0f40c9d50',1,1,99,'2025-04-17 05:56:16','Completed','2025-04-17 05:56:16'),('98eb726a-b333-4171-936f-7c745b5c89eb',0,1,99,'2025-04-17 06:19:58','Completed','2025-04-17 06:19:58'),('9997e3f3-feac-4a50-afbb-386e0d6cf684',1,1,99,'2025-04-19 22:30:58','Cancelled','2025-04-19 22:30:58'),('a00c147b-1208-4574-9817-cc110cccbafe',1,1,99,'2025-04-20 18:39:29','Denied','2025-04-20 18:39:29'),('a32122da-0f9b-46b9-9539-54ef048d264a',1,1,387,'2025-04-10 10:58:35','Completed','2025-04-10 10:58:35'),('b91ff727-3c87-4142-81af-1a21deea5ed4',1,1,99,'2025-04-20 18:16:16','Approved','2025-04-20 18:16:16'),('c05829de-9c58-4fa4-82b7-9992034b3f1a',1,1,129,'2025-04-19 22:39:45','Denied','2025-04-19 22:39:45'),('c10baedd-bb6c-437d-a10e-2742c5d68b42',1,1,387,'2025-04-10 09:15:38','Completed','2025-04-10 09:15:38'),('c47d56c1-dd75-4cea-977c-43e1034836dd',1,1,129,'2025-04-10 17:23:32','Completed','2025-04-10 17:23:32'),('c788e423-01fa-4de3-981c-57bc9fb764fe',1,1,297,'2025-04-20 17:14:56','Cancelled','2025-04-20 17:14:56'),('c9bd7299-ec74-4b31-9716-456aab68918a',1,2,129,'2025-04-20 02:01:00','Cancelled','2025-04-20 02:01:00'),('ca072cf6-ee81-40c0-a634-3a1c63f8db26',1,1,297,'2025-04-20 17:04:34','Cancelled','2025-04-20 17:04:34'),('cd88a3c0-4d39-4784-b7d3-1821d69530dc',1,2,129,'2025-04-20 02:03:13','Cancelled','2025-04-20 02:03:13'),('cfa318a4-6310-4afc-9521-93d22da6d7f6',1,1,99,'2025-04-21 01:44:09','Processing','2025-04-21 01:44:09'),('d69e4d38-b92e-4f9f-828d-efdf69925a68',1,1,99,'2025-04-17 19:47:38','Completed','2025-04-17 19:47:38'),('d7ec9d00-671e-41ba-b207-3f8cc818dab6',1,2,129,'2025-04-20 16:32:08','Cancelled','2025-04-20 16:32:08'),('e06da687-8e36-4657-a48f-48ffe17baf2c',1,2,129,'2025-04-20 17:10:59','Cancelled','2025-04-20 17:10:59'),('e31468f3-f5f1-450b-8339-af277f24704c',1,1,258,'2025-04-10 10:59:55','Completed','2025-04-10 10:59:55'),('e9977bc7-e67f-435e-a1a0-35538139765b',1,1,297,'2025-04-20 17:10:54','Cancelled','2025-04-20 17:10:54'),('f53dba3b-889b-4913-b150-034c11b69fce',1,1,129,'2025-04-10 17:55:31','Completed','2025-04-10 17:55:31'),('faaca148-e515-407b-8671-745d96ce716a',1,1,99,'2025-04-17 05:12:44','Completed','2025-04-17 05:12:44');
/*!40000 ALTER TABLE `Purchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Purchase_Item`
--

DROP TABLE IF EXISTS `Purchase_Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Purchase_Item` (
  `Item_ID` int NOT NULL AUTO_INCREMENT,
  `Purchase_ID` varchar(36) NOT NULL,
  `Product_ID` int NOT NULL,
  `Product_Name` varchar(255) NOT NULL,
  `Quantity` int NOT NULL,
  `Point_Price` int NOT NULL,
  `Dollar_Value` decimal(10,2) NOT NULL,
  PRIMARY KEY (`Item_ID`),
  KEY `idx_purchase_id` (`Purchase_ID`),
  KEY `idx_product_id` (`Product_ID`),
  CONSTRAINT `fk_purchase_item_purchase` FOREIGN KEY (`Purchase_ID`) REFERENCES `Purchase` (`Purchase_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Purchase_Item`
--

LOCK TABLES `Purchase_Item` WRITE;
/*!40000 ALTER TABLE `Purchase_Item` DISABLE KEYS */;
INSERT INTO `Purchase_Item` VALUES (1,'c10baedd-bb6c-437d-a10e-2742c5d68b42',473,'Smooth Criminal',1,129,1.29),(2,'c10baedd-bb6c-437d-a10e-2742c5d68b42',474,'Billie Jean (Single Version)',1,129,1.29),(3,'c10baedd-bb6c-437d-a10e-2742c5d68b42',475,'Black or White',1,129,1.29),(4,'a32122da-0f9b-46b9-9539-54ef048d264a',493,'Billie Jean (Single Version)',1,129,1.29),(5,'a32122da-0f9b-46b9-9539-54ef048d264a',494,'Black or White',1,129,1.29),(6,'a32122da-0f9b-46b9-9539-54ef048d264a',492,'Smooth Criminal',1,129,1.29),(7,'e31468f3-f5f1-450b-8339-af277f24704c',476,'P.Y.T. (Pretty Young Thing)',1,129,1.29),(8,'e31468f3-f5f1-450b-8339-af277f24704c',477,'Shake Your Body (Down to the Ground) [Single Version]',1,129,1.29),(9,'6d7b548d-fa80-4f12-bae7-fd7eb4943eb1',479,'Man In the Mirror',1,129,1.29),(10,'c47d56c1-dd75-4cea-977c-43e1034836dd',478,'Don\'t Stop \'Til You Get Enough',1,129,1.29),(11,'132aacf5-9260-4c9d-9f21-3dbaebcf5d76',480,'Will You Be There (Single Version)',1,129,1.29),(12,'f53dba3b-889b-4913-b150-034c11b69fce',481,'You Are Not Alone (Single Version)',1,129,1.29),(13,'09290216-5668-46ae-bf24-50acf2fbd0f1',495,'Viva la Vida',1,99,0.99),(14,'09290216-5668-46ae-bf24-50acf2fbd0f1',496,'Tiger Rag (feat. Tigeroar Alumni)',1,99,0.99),(15,'09290216-5668-46ae-bf24-50acf2fbd0f1',497,'Never Say Never',1,129,1.29),(16,'1258ca74-61a9-4406-b9b1-fe8e04482799',495,'Viva la Vida',1,99,0.99),(17,'faaca148-e515-407b-8671-745d96ce716a',495,'Viva la Vida',1,99,0.99),(18,'902830be-912a-4503-bd3d-39060cbfaa65',495,'Viva la Vida',1,99,0.99),(19,'63d567ed-c081-47a7-a655-1c25e5b12990',495,'Viva la Vida',1,99,0.99),(20,'91914614-d912-4609-9e51-40c0f40c9d50',498,'When a Man Loves a Perfect Woman',1,99,0.99),(21,'98eb726a-b333-4171-936f-7c745b5c89eb',499,'Medley: Chicken Fried / Jump Right In / Loving You Easy / Homegrown / Colder Weather / Knee Deep',1,99,0.99),(22,'824154ad-4838-40bb-9ef9-f499055cc636',495,'Viva la Vida',1,99,0.99),(23,'d69e4d38-b92e-4f9f-828d-efdf69925a68',495,'Viva la Vida',1,99,0.99),(24,'43aad0d2-59a7-4212-bc15-caf0190f3314',495,'Viva la Vida',1,99,0.99),(25,'9997e3f3-feac-4a50-afbb-386e0d6cf684',496,'Tiger Rag (feat. Tigeroar Alumni)',1,99,0.99),(26,'c05829de-9c58-4fa4-82b7-9992034b3f1a',497,'Never Say Never',1,129,1.29),(27,'8a7ca5d0-7c82-4b52-a870-a0c89299ab53',498,'When a Man Loves a Perfect Woman',1,99,0.99),(28,'39ac2245-e542-4e53-b24f-b2ec50609326',495,'Viva la Vida',1,99,0.99),(29,'8d572f02-7aa2-461a-865c-55db08b958eb',515,'Shake Your Body (Down to the Ground) [Single Version]',1,129,1.29),(30,'c9bd7299-ec74-4b31-9716-456aab68918a',515,'Shake Your Body (Down to the Ground) [Single Version]',1,129,1.29),(31,'cd88a3c0-4d39-4784-b7d3-1821d69530dc',515,'Shake Your Body (Down to the Ground) [Single Version]',1,129,1.29),(32,'8e3c1229-3919-43d6-8f69-13d76554adb4',495,'Viva la Vida',1,99,0.99),(33,'81adce7c-a7c6-4348-9e8c-8a17dddf3245',516,'Human Nature (Single Version)',1,129,1.29),(34,'3aee40e3-47c8-420b-89f2-bc33672c96f0',518,'Blame It On the Boogie',1,129,1.29),(35,'79fafe1e-1ff8-4bd5-a6d9-53f2ea4ef390',499,'Medley: Chicken Fried / Jump Right In / Loving You Easy / Homegrown / Colder Weather / Knee Deep',1,99,0.99),(36,'70977301-153f-491e-8a45-9fd6fb90b3d1',515,'Shake Your Body (Down to the Ground) [Single Version]',1,129,1.29),(37,'70977301-153f-491e-8a45-9fd6fb90b3d1',517,'Remember the Time',1,129,1.29),(38,'70977301-153f-491e-8a45-9fd6fb90b3d1',519,'Dirty Diana',1,129,1.29),(39,'70977301-153f-491e-8a45-9fd6fb90b3d1',520,'You Are Not Alone (Single Version)',1,129,1.29),(40,'254ca080-da1f-48ae-a2a1-15511811fe00',533,'A Perfectly Good Heart',1,129,1.29),(41,'334eb2f2-ee04-483e-8db5-5e3aecb337e5',534,'Picture to Burn',1,129,1.29),(42,'25a25004-0c82-47e2-b11e-6a48dfb235f9',495,'Viva la Vida',1,99,0.99),(43,'25a25004-0c82-47e2-b11e-6a48dfb235f9',497,'Never Say Never',1,129,1.29),(44,'25a25004-0c82-47e2-b11e-6a48dfb235f9',500,'Teenage Mutant Ninja Turtle (Bonus Track)',1,99,0.99),(45,'d7ec9d00-671e-41ba-b207-3f8cc818dab6',534,'Picture to Burn',1,129,1.29),(46,'ca072cf6-ee81-40c0-a634-3a1c63f8db26',495,'Viva la Vida',1,99,0.99),(47,'ca072cf6-ee81-40c0-a634-3a1c63f8db26',496,'Tiger Rag (feat. Tigeroar Alumni)',1,99,0.99),(48,'ca072cf6-ee81-40c0-a634-3a1c63f8db26',499,'Medley: Chicken Fried / Jump Right In / Loving You Easy / Homegrown / Colder Weather / Knee Deep',1,99,0.99),(49,'3e1dd654-6287-4ee7-8d82-d9db9910e9c6',534,'Picture to Burn',1,129,1.29),(50,'e9977bc7-e67f-435e-a1a0-35538139765b',495,'Viva la Vida',1,99,0.99),(51,'e9977bc7-e67f-435e-a1a0-35538139765b',496,'Tiger Rag (feat. Tigeroar Alumni)',1,99,0.99),(52,'e9977bc7-e67f-435e-a1a0-35538139765b',499,'Medley: Chicken Fried / Jump Right In / Loving You Easy / Homegrown / Colder Weather / Knee Deep',1,99,0.99),(53,'e06da687-8e36-4657-a48f-48ffe17baf2c',534,'Picture to Burn',1,129,1.29),(54,'c788e423-01fa-4de3-981c-57bc9fb764fe',502,'Too Much to Ask',1,99,0.99),(55,'c788e423-01fa-4de3-981c-57bc9fb764fe',503,'Waiting For You',1,99,0.99),(56,'c788e423-01fa-4de3-981c-57bc9fb764fe',501,'Fix You',1,99,0.99),(57,'22632e31-0c0a-4cac-9926-88f41e1ddeb2',544,'A Place In This World',1,129,1.29),(58,'b91ff727-3c87-4142-81af-1a21deea5ed4',495,'Viva la Vida',1,99,0.99),(59,'282b094a-65aa-4584-bafa-eaa6fe636ed7',495,'Viva la Vida',1,99,0.99),(60,'a00c147b-1208-4574-9817-cc110cccbafe',495,'Viva la Vida',1,99,0.99),(61,'824d51d6-3654-41f7-a980-4853c5ca200e',499,'Medley: Chicken Fried / Jump Right In / Loving You Easy / Homegrown / Colder Weather / Knee Deep',1,99,0.99),(62,'3a40bf43-c47b-4ab7-a7d7-d415073ddd08',503,'Waiting For You',1,99,0.99),(63,'cfa318a4-6310-4afc-9521-93d22da6d7f6',495,'Viva la Vida',1,99,0.99),(64,'0f43c2a3-eb2f-4ee9-a0ff-959275d5caa8',534,'Picture to Burn',1,129,1.29),(65,'02c3012d-2faf-4ede-9790-5a9cfea50693',495,'Viva la Vida',1,99,0.99);
/*!40000 ALTER TABLE `Purchase_Item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sponsor_Organization`
--

DROP TABLE IF EXISTS `Sponsor_Organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sponsor_Organization` (
  `Sponsor_Org_ID` int NOT NULL AUTO_INCREMENT,
  `Sponsor_Org_Name` varchar(255) DEFAULT NULL,
  `Sponsor_Description` varchar(1000) DEFAULT NULL,
  `Num_Drivers` int DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Phone_Number` varchar(20) DEFAULT NULL,
  `ConversionRate_DtoP` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`Sponsor_Org_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sponsor_Organization`
--

LOCK TABLES `Sponsor_Organization` WRITE;
/*!40000 ALTER TABLE `Sponsor_Organization` DISABLE KEYS */;
INSERT INTO `Sponsor_Organization` VALUES (1,'Sahara','Anything But Kitchen Sinks',100,'updated@sahara.com','1112223333',1.00),(2,'FloorMart','Anything But Floors',75,'contact@floormart.com','0987654321',1.00),(3,'Davis INC','You just got Davised',150,'contact@davisinc.com','1122334455',1.00);
/*!40000 ALTER TABLE `Sponsor_Organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sponsor_Policies`
--

DROP TABLE IF EXISTS `Sponsor_Policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sponsor_Policies` (
  `Policy_ID` int NOT NULL AUTO_INCREMENT,
  `Sponsor_Org_ID` int NOT NULL,
  `Policy_Description` varchar(1000) NOT NULL,
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `Updated_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Policy_ID`),
  KEY `Sponsor_Org_ID` (`Sponsor_Org_ID`),
  CONSTRAINT `Sponsor_Policies_ibfk_1` FOREIGN KEY (`Sponsor_Org_ID`) REFERENCES `Sponsor_Organization` (`Sponsor_Org_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sponsor_Policies`
--

LOCK TABLES `Sponsor_Policies` WRITE;
/*!40000 ALTER TABLE `Sponsor_Policies` DISABLE KEYS */;
INSERT INTO `Sponsor_Policies` VALUES (1,1,'Drivers must follow all traffic laws.','2025-02-26 23:37:31','2025-02-26 23:37:31'),(2,1,'Seat belts are mandatory at all times.','2025-02-26 23:37:31','2025-02-26 23:37:31'),(3,1,'No mobile phone use while driving.','2025-02-26 23:37:31','2025-02-26 23:37:31'),(4,2,'Regular vehicle maintenance checks are required.','2025-02-26 23:37:31','2025-02-26 23:37:31'),(5,2,'No speeding above the limit.','2025-02-26 23:37:31','2025-02-26 23:37:31'),(6,2,'Report accidents immediately.','2025-02-26 23:37:31','2025-02-26 23:37:31'),(7,3,'Respect all pedestrians and cyclists.','2025-02-26 23:37:31','2025-02-26 23:37:31'),(8,3,'Follow company vehicle guidelines.','2025-02-26 23:37:31','2025-02-26 23:37:31'),(9,3,'Avoid unnecessary idling of the vehicle.','2025-02-26 23:37:31','2025-02-26 23:37:31');
/*!40000 ALTER TABLE `Sponsor_Policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sponsor_Preferences`
--

DROP TABLE IF EXISTS `Sponsor_Preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sponsor_Preferences` (
  `User_ID` int NOT NULL,
  `Widget_Order` json NOT NULL,
  PRIMARY KEY (`User_ID`),
  CONSTRAINT `Sponsor_Preferences_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sponsor_Preferences`
--

LOCK TABLES `Sponsor_Preferences` WRITE;
/*!40000 ALTER TABLE `Sponsor_Preferences` DISABLE KEYS */;
INSERT INTO `Sponsor_Preferences` VALUES (2,'[\"driverMetrics\", \"companyInfo\", \"driverHistory\"]'),(59,'[\"driverMetrics\", \"companyInfo\", \"driverHistory\"]'),(61,'[\"driverMetrics\", \"companyInfo\", \"driverHistory\"]');
/*!40000 ALTER TABLE `Sponsor_Preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sponsor_User`
--

DROP TABLE IF EXISTS `Sponsor_User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sponsor_User` (
  `Sponsor_User_ID` int NOT NULL AUTO_INCREMENT,
  `User_ID` int DEFAULT NULL,
  `Sponsor_Org_ID` int DEFAULT NULL,
  `Num_Point_Changes` int DEFAULT '0',
  PRIMARY KEY (`Sponsor_User_ID`),
  UNIQUE KEY `User_ID` (`User_ID`),
  CONSTRAINT `Sponsor_User_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sponsor_User`
--

LOCK TABLES `Sponsor_User` WRITE;
/*!40000 ALTER TABLE `Sponsor_User` DISABLE KEYS */;
INSERT INTO `Sponsor_User` VALUES (1,2,1,0),(2,59,1,0),(3,61,2,0),(4,62,3,0),(5,91,1,0),(6,95,1,0);
/*!40000 ALTER TABLE `Sponsor_User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sponsor_Weekly_Bonus_Config`
--

DROP TABLE IF EXISTS `Sponsor_Weekly_Bonus_Config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sponsor_Weekly_Bonus_Config` (
  `Sponsor_User_ID` int NOT NULL,
  `Weekly_Bonus_Points` int DEFAULT '0',
  `Last_Bonus_Date` date DEFAULT NULL,
  PRIMARY KEY (`Sponsor_User_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sponsor_Weekly_Bonus_Config`
--

LOCK TABLES `Sponsor_Weekly_Bonus_Config` WRITE;
/*!40000 ALTER TABLE `Sponsor_Weekly_Bonus_Config` DISABLE KEYS */;
INSERT INTO `Sponsor_Weekly_Bonus_Config` VALUES (1,10,'2025-04-03');
/*!40000 ALTER TABLE `Sponsor_Weekly_Bonus_Config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `User_ID` int NOT NULL AUTO_INCREMENT,
  `FName` varchar(255) DEFAULT NULL,
  `LName` varchar(255) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Phone_Number` varchar(15) DEFAULT NULL,
  `Start_Date` date DEFAULT NULL,
  `End_Date` date DEFAULT NULL,
  `Cognito_Sub` varchar(255) DEFAULT NULL,
  `Username` varchar(255) DEFAULT NULL,
  `User_Type` enum('defaultUser','driver','sponsor','admin') DEFAULT 'defaultUser',
  PRIMARY KEY (`User_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,'Davis','Little','dhlittl@clemson.edu','+18648887203','2025-04-10',NULL,'94a8f4b8-6031-7052-fb2c-c4659619f9c9','dhlittl','driver'),(2,'Marcelo','Diaz','mdiazdu@clemson.edu','5709808357','2025-04-10',NULL,'e4c894e8-8011-70cf-e60d-a2db9db23bf8','marcelo','sponsor'),(57,'Admin','Test','admin@test.com','+11234567890','2025-04-19',NULL,'d4a87468-9001-703b-fc3c-40022d5664ec','admin','admin'),(58,'Alaina','Carson','lainalaire@gmail.com','+18646345043','2025-04-19',NULL,'7448f488-b061-700d-cd70-cfad6fa77f89','alaina','admin'),(59,'Oh','Wasis','sponsor@fake.com','+11111111111','2025-04-19',NULL,'74d8f448-4051-707d-3103-d55aa81790f5','sponsor1','sponsor'),(60,'Jeremy','Cavuto','jeremycavuto@icloud.com','+19737275789','2025-04-19',NULL,'84b8f4f8-1041-706a-b9b8-5f2fd200412e','jeremy','driver'),(61,'Janny','Tohr','sponsor@fake.com','+12222222222','2025-04-19',NULL,'24682408-1071-70b2-6900-2edc3a8a9e6a','sponsor2','sponsor'),(62,'Davis Inc','Sponsor','sponsor@fake.com','+13333333333','2025-04-19',NULL,'14a89478-90a1-70e2-47d8-27bef134fed3','sponsor3','sponsor'),(63,'John','Doe','johndoe@fake.com','2222222222','2025-04-19',NULL,'344824f8-b081-70db-90b2-d2fb1c5adfe2','driver1','driver'),(64,'George','Washington','driver@fake.com','1234567890','2025-04-19',NULL,'e48834e8-a001-702a-d9ca-9238f863b287','driver2','driver'),(65,'Maggie','Smith','driver@fake.com','1234567890','2025-04-19',NULL,'14886468-d031-705b-7dd3-642ebb2eda1c','driver3','driver'),(66,'Donnie','Darko','ddarko@fake.com','1234567890','2025-04-19',NULL,'04482488-3021-7038-2940-0daebe4a3fc3','driver4','driver'),(76,'Jeremy','Test','jeremytest@gmail.com','+12013885995','2025-04-20',NULL,'b4f8f448-40e1-7034-1eda-931b8ca685bf','jeremytest','driver'),(77,'Steve','Le Puisson','steve@fake.com','1234567890','2025-04-20',NULL,'c4b894f8-8031-70e6-4134-c4393a064bb7','driver5','driver'),(78,'Avery','Carson','avbcarson@gmail.com','0000000000','2025-04-20',NULL,'148894b8-10f1-709a-a4cb-bf2120fe0e10',NULL,'driver'),(79,'Martin','Floor','samevins202@gmail.com','9876543221','2025-04-20',NULL,'64a81488-b041-706c-73e3-e425d606db7f','pidgeyarmy',''),(88,'Demo','Test Driver','davelittle789@gmail.com','1111111111','2025-04-21',NULL,'04583418-d0b1-7087-c5bc-25a490df6fce','demotestdriver','driver'),(89,'Demo','Test Sponsor','demotestsponsor@fake.com','+11111111111','2025-04-21',NULL,'','demotestsponsor','defaultUser'),(90,'','','','','2025-04-21',NULL,'442824c8-70a1-7086-4c29-3f226bddacd2',NULL,'defaultUser'),(91,'Demo ','Test Sponsor2','demo@fake.com','+11111111111','2025-04-21',NULL,'246844b8-e0f1-7034-6af1-a97e95e384b1','demotestsponsor2','sponsor'),(92,'Demo','Test Admin','demo@fake.com','+11111111111','2025-04-21',NULL,'748824b8-40c1-706c-7248-d50c1e5dcd74','demotestadmin','admin'),(93,'Demo','Test Driver2','demo@fake.com','+11111111111','2025-04-21',NULL,'f4a8f478-7031-700f-2267-63e72dcd7337','demotestdriver2','defaultUser'),(94,'','','','','2025-04-21',NULL,'9498b4f8-f081-7049-f6da-6da8184cdd72',NULL,'defaultUser'),(95,'Death','Taxes','no@fake.com','+11234567890','2025-04-21',NULL,'7408c4a8-8051-7072-cb36-544a3c8a81d4','newSponsor','sponsor');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `before_user_insert` BEFORE INSERT ON `User` FOR EACH ROW BEGIN
    DECLARE existing_count INT;
    
    -- Skip empty Cognito_Sub values
    IF NEW.Cognito_Sub IS NOT NULL AND NEW.Cognito_Sub != '' THEN
        -- Check if this Cognito_Sub already exists
        SELECT COUNT(*) INTO existing_count
        FROM User
        WHERE Cognito_Sub = NEW.Cognito_Sub;
        
        -- If a user with this Cognito_Sub already exists, trigger an error
        IF existing_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: Cannot insert duplicate Cognito_Sub';
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `prevent_null_username` BEFORE UPDATE ON `User` FOR EACH ROW BEGIN
    IF NEW.Username IS NULL AND OLD.Username IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Username cannot be set to NULL';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping events for database 'team24database'
--

--
-- Dumping routines for database 'team24database'
--
/*!50003 DROP PROCEDURE IF EXISTS `AddAdmin` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `AddAdmin`(
    IN p_User_ID INT
)
BEGIN
    UPDATE User 
    SET User_Type = 'Admin'
    WHERE User_ID = p_User_ID;

    INSERT INTO Admin (User_ID)
    VALUES (p_User_ID);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `AddDriver` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `AddDriver`(
  IN p_user_id INT,
  IN p_sponsor_org_id INT
)
BEGIN
  DECLARE new_driver_id INT;

  -- Only add to Driver if user is not already a driver
  IF NOT EXISTS (
    SELECT 1 FROM Driver WHERE User_ID = p_user_id
  ) THEN
    -- Insert new driver with reference to user
    INSERT INTO Driver (User_ID)
    VALUES (p_user_id);

    -- Capture new Driver_ID
    SET new_driver_id = LAST_INSERT_ID();

    -- Insert driver-sponsor relationship
    INSERT INTO Driver_To_SponsorOrg (Driver_ID, Sponsor_Org_ID, Point_Balance)
    VALUES (new_driver_id, p_sponsor_org_id, 0);

    -- Update user type to 'driver'
    UPDATE User
    SET User_Type = 'driver'
    WHERE User_ID = p_user_id;

  ELSE
    -- If driver already exists, fetch the existing Driver_ID
    SELECT Driver_ID INTO new_driver_id
    FROM Driver
    WHERE User_ID = p_user_id;

    -- Prevent duplicate driver-sponsor link
    IF NOT EXISTS (
      SELECT 1 FROM Driver_To_SponsorOrg
      WHERE Driver_ID = new_driver_id AND Sponsor_Org_ID = p_sponsor_org_id
    ) THEN
      INSERT INTO Driver_To_SponsorOrg (Driver_ID, Sponsor_Org_ID, Point_Balance)
      VALUES (new_driver_id, p_sponsor_org_id, 0);
    END IF;
  END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `AddSponsorUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `AddSponsorUser`(
    IN p_User_ID INT,
    IN p_Sponsor_Org_ID INT,
    IN p_Num_Point_Changes INT
)
BEGIN
    UPDATE User 
    SET User_Type = 'Sponsor'
    WHERE User_ID = p_User_ID;

    INSERT INTO Sponsor_User (User_ID, Sponsor_Org_ID, Num_Point_Changes)
    VALUES (p_User_ID, p_Sponsor_Org_ID, p_Num_Point_Changes);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `AddUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `AddUser`(
    IN p_username VARCHAR(255),
    IN p_FName VARCHAR(255),
    IN p_LName VARCHAR(255),
    IN p_Email VARCHAR(255),
    IN p_Phone_Number VARCHAR(15),
    IN p_Cognito_Sub VARCHAR(255)
)
BEGIN
    INSERT INTO User (
        Username,
        FName,
        LName,
        Email,
        Phone_Number,
        Start_Date,
        End_Date,
        User_Type,
        Cognito_Sub
    )
    VALUES (
        p_username,
        p_FName,
        p_LName,
        p_Email,
        p_Phone_Number,
        CURDATE(),
        NULL,
        'defaultUser',
        p_Cognito_Sub
    );

    SELECT LAST_INSERT_ID() AS User_ID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `createNewSponsorDriver` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `createNewSponsorDriver`(IN p_user_id INT, IN p_sponsor_org_id INT)
BEGIN

	DECLARE new_driver_id INT;
  -- Only add if user is not already a driver
  IF NOT EXISTS (
    SELECT 1 FROM Driver WHERE User_ID = p_user_id
  ) THEN
    -- Insert into Driver (now including Sponsor_Org_ID)
    INSERT INTO Driver (User_ID)
    VALUES (p_user_id);

	 SELECT Driver_ID INTO new_driver_id
	FROM Driver
	WHERE User_ID = p_user_id;

    -- Optional: Still insert into Driver_To_SponsorOrg if you're keeping it
    INSERT INTO Driver_To_SponsorOrg (Driver_ID, Sponsor_Org_ID)
    VALUES (new_driver_id, p_sponsor_org_id);

    -- Update user type to 'driver'
    UPDATE User
    SET User_Type = 'driver'
    WHERE User_ID = p_user_id;
  END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `export_audit_logs_weekly` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `export_audit_logs_weekly`(
    IN p_start_date DATETIME,
    IN p_end_date DATETIME
)
BEGIN
    SELECT
        Audit_ID,
        Event_Type,
        User_ID,
        Target_Entity,
        Target_ID,
        Action_Description,
        Timestamp,
        Metadata
    FROM Audit_Log
    WHERE Timestamp BETWEEN p_start_date AND p_end_date
    ORDER BY Timestamp DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAdminInfo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetAdminInfo`(IN p_user_id INT)
BEGIN
    SELECT
        a.Admin_ID,
        a.User_ID,
        u.FName,
        u.LName,
        u.Email,
        u.Phone_Number,
        u.Start_Date,
        u.End_Date,
        u.Username
    FROM Admin a
    JOIN User u ON u.User_ID = a.User_ID
    WHERE a.User_ID = p_user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAdminWidgetOrder` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetAdminWidgetOrder`(
    IN user_id INT
)
BEGIN
    SELECT Widget_Order
    FROM Admin_Preferences
    WHERE User_ID = user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllAdmins` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetAllAdmins`()
BEGIN
    SELECT * FROM Admin;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllDrivers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetAllDrivers`()
BEGIN
    SELECT * FROM Driver;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllPointChanges` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetAllPointChanges`(IN p_User_ID INT)
BEGIN
	DECLARE v_Driver_ID INT;
    SET v_Driver_ID = (SELECT Driver_ID FROM Driver WHERE User_ID = p_User_ID LIMIT 1);
    
    SELECT p.*, s.Sponsor_Org_Name FROM Point_Changes p LEFT JOIN Sponsor_Organization s ON s.Sponsor_Org_ID = p.Sponsor_Org_ID WHERE Driver_ID = v_Driver_ID ;
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllSponsorUsers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetAllSponsorUsers`()
BEGIN
    SELECT * FROM Sponsor_User;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetAllUsers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetAllUsers`()
BEGIN
    SELECT * FROM User;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetCurrentUserID` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetCurrentUserID`(IN in_username varchar(255))
BEGIN
	SELECT User_ID FROM User u WHERE u.Username = in_username LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetDefaultUserInfo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetDefaultUserInfo`(IN p_user_id INT)
BEGIN
    SELECT
        u.User_ID,
        u.FName,
        u.LName,
        u.Email,
        u.Phone_Number,
        u.Start_Date,
        u.End_Date,
        u.Username,

        a.Application_ID,
        a.Sponsor_Org_ID,                             -- ✅ ADD THIS LINE
        s.Sponsor_Org_Name  AS Sponsor_Name,
        a.App_Status,
        a.Submitted_At,
        a.Processed_At
    FROM User u
    LEFT JOIN Driver_Applications a  ON a.User_ID = u.User_ID
    LEFT JOIN Sponsor_Organization s ON s.Sponsor_Org_ID = a.Sponsor_Org_ID
    WHERE u.User_ID = p_user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetDefaultUserWidgetOrder` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetDefaultUserWidgetOrder`(
    IN user_id INT
)
BEGIN
    SELECT Widget_Order
    FROM Default_User_Preferences
    WHERE User_ID = user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetDriverInfo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetDriverInfo`(IN p_user_id INT)
BEGIN
    SELECT
        d.Driver_ID,
        d.User_ID,
        ds.Point_Balance,  -- Moved from Driver to Driver_To_SponsorOrg
        org.Sponsor_Org_ID,
        org.Sponsor_Org_Name AS Sponsor_Name,
        u.FName,
        u.LName,
        u.Email,
        u.Phone_Number,
        u.Start_Date,
        u.End_Date,
        u.Username
    FROM Driver d
    JOIN User u ON u.User_ID = d.User_ID
    JOIN Driver_To_SponsorOrg ds ON ds.Driver_ID = d.Driver_ID
    JOIN Sponsor_Organization org ON org.Sponsor_Org_ID = ds.Sponsor_Org_ID
    WHERE d.User_ID = p_user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetDriverPointGoal` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetDriverPointGoal`(IN user_id INT)
BEGIN
    SELECT Point_Goal
    FROM Driver
    WHERE User_ID = user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetDriverWidgetOrder` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetDriverWidgetOrder`(IN user_id INT)
BEGIN
    SELECT Widget_Order
    FROM Driver_Preferences
    WHERE User_ID = user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getMostRecentAboutPage` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `getMostRecentAboutPage`()
BEGIN
	SELECT *
    FROM About_Page
    ORDER BY ReleaseDate desc
	LIMIT 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getPendingApplications` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `getPendingApplications`(
    IN p_sponsor_id INT
)
BEGIN 
    SELECT
        Application_ID,
        User_ID,               
        FName,
        LName,
        Email,
        Phone,
        Submitted_At,
        Sponsor_Org_ID  -- ✅ Add this line
    FROM Driver_Applications
    WHERE App_Status = 'Pending'
      AND Sponsor_Org_ID = p_sponsor_id;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetPointsByDriver` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetPointsByDriver`(IN p_DriverID INT)
BEGIN
    SELECT 
        d2s.Sponsor_Org_ID,
        s.Sponsor_Org_Name,
        d2s.Point_Balance,
        IFNULL(b.PointsAdded, 0) AS PointsAdded,
        IFNULL(c.PointsSubbed, 0) AS PointsSubbed
    FROM 
        Driver_To_SponsorOrg d2s
    JOIN 
        Sponsor_Organization s ON s.Sponsor_Org_ID = d2s.Sponsor_Org_ID
    LEFT JOIN 
        (SELECT SUM(Num_Points) AS PointsAdded, Sponsor_Org_ID, Driver_ID 
         FROM Point_Changes 
         WHERE Driver_ID = p_DriverID AND Point_Change_Type = 'ADD'
         GROUP BY Sponsor_Org_ID) AS b 
        ON b.Sponsor_Org_ID = d2s.Sponsor_Org_ID AND b.Driver_ID = d2s.Driver_ID
    LEFT JOIN 
        (SELECT SUM(ABS(Num_Points)) AS PointsSubbed, Sponsor_Org_ID, Driver_ID 
         FROM Point_Changes 
         WHERE Driver_ID = p_DriverID AND Point_Change_Type = 'SUB'
         GROUP BY Sponsor_Org_ID) AS c 
        ON c.Sponsor_Org_ID = d2s.Sponsor_Org_ID AND c.Driver_ID = d2s.Driver_ID
    WHERE d2s.Driver_ID = p_DriverID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetSponsorDrivers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetSponsorDrivers`(
    IN p_Sponsor_Org_ID INT
)
BEGIN
    SELECT 
        d.Driver_ID, 
        d.User_ID, 
        CONCAT(u.FName, ' ', u.LName) AS Driver_Name,
        dto.Point_Balance,
        IFNULL(p.Num_Purchases, 0) AS Num_Purchases
    FROM Driver d
    INNER JOIN User u ON d.User_ID = u.User_ID
    INNER JOIN Driver_To_SponsorOrg dto ON d.Driver_ID = dto.Driver_ID AND dto.Sponsor_Org_ID = p_Sponsor_Org_ID
    LEFT JOIN (
        SELECT Driver_ID, COUNT(*) AS Num_Purchases
        FROM Purchase
        WHERE Sponsor_Org_ID = p_Sponsor_Org_ID
        GROUP BY Driver_ID
    ) p ON d.Driver_ID = p.Driver_ID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetSponsorInfo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetSponsorInfo`()
BEGIN
    SELECT *
    FROM Sponsor_Organization;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getSponsorPointTracking` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `getSponsorPointTracking`(IN p_sponsor_org_id INT)
BEGIN
	SELECT 
    u.FName as DriverFirstName,
    u.LName as DriverLastName,
    dts.Point_Balance as TotalPoints,
    p.Num_Points,
    p.Point_Change_Type,
    p.Reason,
    p.Change_Date,
    p.Exp_Date,
    u2.FName as SponsorFirstName,
    u2.LName as SponsorLastName
    FROM Point_Changes p 
    LEFT JOIN Driver d ON d.Driver_ID = p.Driver_ID
    LEFT JOIN User u ON u.User_ID = d.User_ID
    LEFT JOIN Sponsor_User s ON s.Sponsor_User_ID = p.Sponsor_User_ID
    LEFT JOIN Driver_To_SponsorOrg dts ON dts.Sponsor_Org_ID = p.Sponsor_Org_ID AND dts.Driver_ID = p.Driver_ID
    LEFT JOIN User u2 ON u2.user_ID = s.User_ID
    WHERE p.Sponsor_Org_ID = p_sponsor_org_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getSponsorPolicies` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `getSponsorPolicies`()
BEGIN
    SELECT Policy_ID, Sponsor_Org_ID, Policy_Description, Created_At, Updated_At
    FROM Sponsor_Policies;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetSponsorUserInfo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetSponsorUserInfo`(IN p_user_id INT)
BEGIN
    SELECT
        su.Sponsor_User_ID,
        su.User_ID,
        su.Sponsor_Org_ID,
        org.Sponsor_Org_Name  AS Sponsor_Name,
        su.Num_Point_Changes,
        u.FName,
        u.LName,
        u.Email,
        u.Phone_Number,
        u.Start_Date,
        u.End_Date,
        u.Username
    FROM Sponsor_User su
    JOIN User u               ON u.User_ID = su.User_ID
    LEFT JOIN Sponsor_Organization org
                               ON org.Sponsor_Org_ID = su.Sponsor_Org_ID
    WHERE su.User_ID = p_user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetSponsorUsers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetSponsorUsers`(IN sponsorId INT)
BEGIN
    SELECT 
        su.Sponsor_User_ID, 
        su.User_ID, 
        su.Sponsor_Org_ID, 
        su.Num_Point_Changes,
        CONCAT(u.FName, ' ', u.LName) AS Name,
        u.Email,
        u.Phone_Number,
        u.Username,
        u.Start_Date     -- Added Start Date
    FROM Sponsor_User su
    JOIN User u ON su.User_ID = u.User_ID
    WHERE su.Sponsor_Org_ID = sponsorId;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetSponsorWidgetOrder` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetSponsorWidgetOrder`(
    IN user_id INT
)
BEGIN
    SELECT Widget_Order
    FROM Sponsor_Preferences
    WHERE User_ID = user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetUserByID` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `GetUserByID`(IN p_userID INT)
BEGIN
	SELECT * FROM User u WHERE u.User_ID = p_userID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `insertNewAboutPage` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `insertNewAboutPage`(IN newTeamNumber int,
										IN newSprintNumber int,
                                        IN newReleaseDate date,
                                        IN newProductName varchar(50),
                                        IN newProductDescription varchar(1000))
BEGIN
	INSERT INTO About_Page(TeamNumber, SprintNumber, ReleaseDate, ProductName, ProductDescription)
    VALUES(newTeamNumber, newSprintNumber, newReleaseDate, newProductName, newProductDescription);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `registerDriverApplication` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `registerDriverApplication`(
    IN sponsor_id INT,
    IN user_id INT,
    IN fname VARCHAR(100),
    IN lname VARCHAR(100),
    IN email VARCHAR(100),
    IN phone VARCHAR(20),
    IN q1_ans VARCHAR(1000),
    IN q2_ans VARCHAR(1000),
    IN q3_ans VARCHAR(1000)
)
BEGIN
    INSERT INTO Driver_Applications (
        Sponsor_Org_ID,
        User_ID,
        FName,
        LName,
        Email,
        Phone,
        App_Status,
        Q1_Ans,
        Q2_Ans,
        Q3_Ans,
        All_Policies_Agreed,
        Submitted_At
    ) VALUES (
        sponsor_id,
        user_id,
        fname,
        lname,
        email,
        phone,
        'Pending',
        q1_ans,
        q2_ans,
        q3_ans,
        1,
        NOW()
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `registerSponsorUser` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `registerSponsorUser`(
    IN p_FName VARCHAR(255),
    IN p_LName VARCHAR(255),
    IN p_Email VARCHAR(255),
    IN p_Phone_Number VARCHAR(15),
    IN p_Sponsor_Org_ID INT,
    IN p_Cognito_Sub VARCHAR(255)
)
BEGIN
    DECLARE new_user_id INT;

    INSERT INTO User (FName, LName, Email, Phone_Number, Start_Date, End_Date, Cognito_Sub)
    VALUES (p_FName, p_LName, p_Email, p_Phone_Number, CURDATE(), NULL, p_Cognito_Sub);

    SET new_user_id = LAST_INSERT_ID();

    INSERT INTO Sponsor_User (User_ID, Sponsor_Org_ID, Num_Point_Changes)
    VALUES (new_user_id, p_Sponsor_Org_ID, 0);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `report_driver_applications` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `report_driver_applications`(
    IN p_start_date DATETIME,
    IN p_end_date DATETIME,
    IN p_sponsor_id INT
)
BEGIN
    SELECT
        Application_ID,
        Sponsor_Org_ID,
        CONCAT(FName, ' ', LName) AS Driver_Name,
        Email,
        Phone,
        App_Status,
        Submitted_At,
        Processed_At,
        Q1_Ans,
        Q2_Ans,
        CASE
            WHEN All_Policies_Agreed = 1 THEN 'Yes'
            ELSE 'No'
        END AS Policies_Agreed
    FROM Driver_Applications
    WHERE
        Sponsor_Org_ID = p_sponsor_id
        AND (
            Processed_At BETWEEN p_start_date AND p_end_date
            OR Processed_At IS NULL
        )
    ORDER BY
        CASE WHEN Processed_At IS NULL THEN 1 ELSE 0 END,
        Processed_At DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `report_point_change_audit_log` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `report_point_change_audit_log`(
    IN in_start_date DATE,
    IN in_end_date DATE,
    IN in_sponsor_org_id INT
)
BEGIN
    SELECT 
        Points_Change_ID,
        Driver_ID,
        Sponsor_User_ID,
        Num_Points,
        Point_Change_Type,
        Reason,
        Change_Date
    FROM Point_Changes
    WHERE Sponsor_User_ID = in_sponsor_org_id
      AND Change_Date BETWEEN in_start_date AND in_end_date
    ORDER BY Change_Date DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `reviewDriverApplication` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `reviewDriverApplication`(
    IN p_application_id INT,
    IN p_sponsor_id INT,
    IN p_status VARCHAR(10)
)
BEGIN
    if p_status NOT IN ('Approved', 'Denied') THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Invalid status value';
       END IF;

    UPDATE Driver_Applications
    SET App_Status = p_status,
        Processed_At = NOW()
    WHERE Application_ID = p_application_id
      AND Sponsor_Org_ID = p_sponsor_id
      AND App_Status = 'Pending';

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Application not found or already processed';
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateAdminWidgetOrder` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `UpdateAdminWidgetOrder`(
    IN user_id INT,
    IN widget_order JSON
)
BEGIN
    UPDATE Admin_Preferences
    SET Widget_Order = widget_order
    WHERE User_ID = user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateDefaultUserWidgetOrder` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `UpdateDefaultUserWidgetOrder`(
    IN user_id INT,
    IN widget_order JSON
)
BEGIN
    UPDATE Default_User_Preferences
    SET Widget_Order = widget_order
    WHERE User_ID = user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateDriverPointGoal` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `UpdateDriverPointGoal`(IN driver_id INT, IN new_point_goal INT)
BEGIN   
    UPDATE Driver
    SET Point_Goal = new_point_goal
    WHERE Driver_ID = driver_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateDriverPoints` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `UpdateDriverPoints`(
    IN in_driver_id INT,
    IN in_sponsor_org_id INT,
    IN in_sponsor_user_id INT,
    IN in_num_points INT,
    IN in_reason VARCHAR(255)
)
BEGIN
    DECLARE change_type VARCHAR(4);
    DECLARE relationship_exists INT;

    IF in_num_points >= 0 THEN
        SET change_type = 'ADD';
    ELSE
        SET change_type = 'SUB';
    END IF;

    -- Check if driver-sponsor relationship exists
    SELECT COUNT(*) INTO relationship_exists 
    FROM Driver_To_SponsorOrg 
    WHERE Driver_ID = in_driver_id AND Sponsor_Org_ID = in_sponsor_org_id;
    
    -- Create relationship if it doesn't exist
    IF relationship_exists = 0 THEN
        INSERT INTO Driver_To_SponsorOrg (Driver_ID, Sponsor_Org_ID, Point_Balance) 
        VALUES (in_driver_id, in_sponsor_org_id, 0);
    END IF;

    -- Update the points in Driver_To_SponsorOrg
    UPDATE Driver_To_SponsorOrg
    SET Point_Balance = Point_Balance + in_num_points
    WHERE Driver_ID = in_driver_id
    AND Sponsor_Org_ID = in_sponsor_org_id;

    -- Record the change in Point_Changes
    INSERT INTO Point_Changes (
        Driver_ID,
        Sponsor_Org_ID,
        Sponsor_User_ID,
        Num_Points,
        Point_Change_Type,
        Reason,
        Change_Date
    ) VALUES (
        in_driver_id,
        in_sponsor_org_id,
        in_sponsor_user_id,
        in_num_points,
        change_type,
        in_reason,
        NOW()
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateDriverWidgetOrder` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `UpdateDriverWidgetOrder`(IN user_id INT, IN widget_order JSON)
BEGIN
  UPDATE Driver_Preferences
  SET Widget_Order = widget_order
  WHERE User_ID = user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateSponsorWidgetOrder` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `UpdateSponsorWidgetOrder`(
    IN user_id INT,
    IN widget_order JSON
)
BEGIN
    UPDATE Sponsor_Preferences
    SET Widget_Order = widget_order
    WHERE User_ID = user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `UpdateUserInfo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `UpdateUserInfo`(
    IN p_User_ID INT,
    IN p_Username VARCHAR(255),
    IN p_FName VARCHAR(255),
    IN p_LName VARCHAR(255),
    IN p_Email VARCHAR(255),
    IN p_Phone_Number VARCHAR(15)
)
BEGIN
    UPDATE User
    SET 
        Username = p_Username,
        FName = p_FName,
        LName = p_LName,
        Email = p_Email,
        Phone_Number = p_Phone_Number
    WHERE User_ID = p_User_ID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-20 22:19:34
