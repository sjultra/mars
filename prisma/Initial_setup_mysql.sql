CREATE DATABASE  IF NOT EXISTS `Mars` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `Mars`;
-- MySQL dump 10.13  Distrib 8.0.22, for macos10.15 (x86_64)
--
-- Host: 127.0.0.1    Database: Mars
-- ------------------------------------------------------
-- Server version	8.0.22

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

--
-- Table structure for table `getGCPIP`
--

DROP TABLE IF EXISTS `getGCPIP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `getGCPIP` (
  `instance_id` varchar(45) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `ip_type` varchar(45) DEFAULT NULL,
  `first_seen` datetime DEFAULT NULL,
  `last_seen` datetime DEFAULT NULL,
  PRIMARY KEY (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `getGCPIP`
--

LOCK TABLES `getGCPIP` WRITE;
/*!40000 ALTER TABLE `getGCPIP` DISABLE KEYS */;
/*!40000 ALTER TABLE `getGCPIP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `getGCPLicense`
--

DROP TABLE IF EXISTS `getGCPLicense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `getGCPLicense` (
  `instance_id` varchar(45) NOT NULL,
  `license` varchar(45) DEFAULT NULL,
  `first_seen` datetime DEFAULT NULL,
  `last_seen` datetime DEFAULT NULL,
  PRIMARY KEY (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `getGCPLicense`
--

LOCK TABLES `getGCPLicense` WRITE;
/*!40000 ALTER TABLE `getGCPLicense` DISABLE KEYS */;
/*!40000 ALTER TABLE `getGCPLicense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `getGCPProjects`
--

DROP TABLE IF EXISTS `getGCPProjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `getGCPProjects` (
  `project_id` varchar(45) NOT NULL,
  `project_name` varchar(45) DEFAULT NULL,
  `project_owner` varchar(45) DEFAULT NULL,
  `product` varchar(45) DEFAULT NULL,
  `expensetype` varchar(45) DEFAULT NULL,
  `organization` varchar(45) DEFAULT NULL,
  `first_seen` datetime DEFAULT NULL,
  `last_seen` datetime DEFAULT NULL,
  PRIMARY KEY (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `getGCPProjects`
--

LOCK TABLES `getGCPProjects` WRITE;
/*!40000 ALTER TABLE `getGCPProjects` DISABLE KEYS */;
/*!40000 ALTER TABLE `getGCPProjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `getGCPVMs`
--

DROP TABLE IF EXISTS `getGCPVMs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `getGCPVMs` (
  `instance_id` varchar(45) NOT NULL,
  `creation_tls` datetime DEFAULT NULL,
  `first_seen` datetime DEFAULT NULL,
  `last_seen` datetime DEFAULT NULL,
  `vm_name` varchar(45) DEFAULT NULL,
  `current_status` varchar(45) DEFAULT NULL,
  `daily_runtime` int DEFAULT NULL,
  `mt_family` varchar(45) DEFAULT NULL,
  `machine_type` varchar(45) DEFAULT NULL,
  `cpu_type` varchar(45) DEFAULT NULL,
  `cpu_num` int DEFAULT NULL,
  `gb_mem` float DEFAULT NULL,
  `pd_std_total` int DEFAULT NULL,
  `ps_ssd_total` int DEFAULT NULL,
  `local_ssd_total` int DEFAULT NULL,
  `vm_owner` varchar(45) DEFAULT NULL,
  `region` varchar(45) DEFAULT NULL,
  `zone` varchar(45) DEFAULT NULL,
  `project_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`instance_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `getGCPVMs`
--

LOCK TABLES `getGCPVMs` WRITE;
/*!40000 ALTER TABLE `getGCPVMs` DISABLE KEYS */;
/*!40000 ALTER TABLE `getGCPVMs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `getPrismaAuditLogs`
--

DROP TABLE IF EXISTS `getPrismaAuditLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `getPrismaAuditLogs` (
  `timestamp` varchar(45) NOT NULL,
  `user` varchar(45) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `resource_type` varchar(45) DEFAULT NULL,
  `resource_name` varchar(45) DEFAULT NULL,
  `action` varchar(45) DEFAULT NULL,
  `result` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `getPrismaAuditLogs`
--

LOCK TABLES `getPrismaAuditLogs` WRITE;
/*!40000 ALTER TABLE `getPrismaAuditLogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `getPrismaAuditLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `getPrismaCompliance`
--

DROP TABLE IF EXISTS `getPrismaCompliance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `getPrismaCompliance` (
  `name` varchar(45) NOT NULL,
  `description` varchar(45) DEFAULT NULL,
  `cloud` varchar(45) DEFAULT NULL,
  `created_by` varchar(45) DEFAULT NULL,
  `last_modified_by` varchar(45) DEFAULT NULL,
  `last_modified_on` varchar(45) DEFAULT NULL,
  `policies_assigned` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `getPrismaCompliance`
--

LOCK TABLES `getPrismaCompliance` WRITE;
/*!40000 ALTER TABLE `getPrismaCompliance` DISABLE KEYS */;
/*!40000 ALTER TABLE `getPrismaCompliance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `getPrismaPolicies`
--

DROP TABLE IF EXISTS `getPrismaPolicies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `getPrismaPolicies` (
  `policy_descriptor` varchar(45) NOT NULL,
  `policy_name` varchar(45) DEFAULT NULL,
  `compliance_requirement` varchar(45) DEFAULT NULL,
  `compliance_section` varchar(45) DEFAULT NULL,
  `category` varchar(45) DEFAULT NULL,
  `policy_class` varchar(45) DEFAULT NULL,
  `policy_sub_types` varchar(45) DEFAULT NULL,
  `cloud` varchar(45) DEFAULT NULL,
  `severity` varchar(45) DEFAULT NULL,
  `policy_type` varchar(45) DEFAULT NULL,
  `labels` varchar(45) DEFAULT NULL,
  `remediable` varchar(45) DEFAULT NULL,
  `policy_mode` varchar(45) DEFAULT NULL,
  `standards` varchar(45) DEFAULT NULL,
  `last_modified_by` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `rql` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`policy_descriptor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `getPrismaPolicies`
--

LOCK TABLES `getPrismaPolicies` WRITE;
/*!40000 ALTER TABLE `getPrismaPolicies` DISABLE KEYS */;
/*!40000 ALTER TABLE `getPrismaPolicies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `getPrismaPolicyCompliance`
--

DROP TABLE IF EXISTS `getPrismaPolicyCompliance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `getPrismaPolicyCompliance` (
  `standard_name` varchar(45) NOT NULL,
  `standard_description` varchar(45) DEFAULT NULL,
  `requirement_id` varchar(45) DEFAULT NULL,
  `rights_of_the_data_subject` varchar(45) DEFAULT NULL,
  `section_id` varchar(45) DEFAULT NULL,
  `section_description` varchar(45) DEFAULT NULL,
  `section_label` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`standard_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `getPrismaPolicyCompliance`
--

LOCK TABLES `getPrismaPolicyCompliance` WRITE;
/*!40000 ALTER TABLE `getPrismaPolicyCompliance` DISABLE KEYS */;
/*!40000 ALTER TABLE `getPrismaPolicyCompliance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `getPrismaSA`
--

DROP TABLE IF EXISTS `getPrismaSA`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `getPrismaSA` (
  `name` varchar(45) NOT NULL,
  `created_by` varchar(45) DEFAULT NULL,
  `created_at` varchar(45) DEFAULT NULL,
  `last_used` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `expires_on` varchar(45) DEFAULT NULL,
  `role_name` varchar(45) DEFAULT NULL,
  `role_type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `getPrismaSA`
--

LOCK TABLES `getPrismaSA` WRITE;
/*!40000 ALTER TABLE `getPrismaSA` DISABLE KEYS */;
/*!40000 ALTER TABLE `getPrismaSA` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `getPrismaUsers`
--

DROP TABLE IF EXISTS `getPrismaUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `getPrismaUsers` (
  `email` varchar(45) NOT NULL,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `time_zone` varchar(45) DEFAULT NULL,
  `enabled` varchar(45) DEFAULT NULL,
  `last_modified_by` varchar(45) DEFAULT NULL,
  `last_modified_at` varchar(45) DEFAULT NULL,
  `last_login_at` varchar(45) DEFAULT NULL,
  `role_name` varchar(45) DEFAULT NULL,
  `role_type` varchar(45) DEFAULT NULL,
  `display_name` varchar(45) DEFAULT NULL,
  `access_keys_allowed` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `getPrismaUsers`
--

LOCK TABLES `getPrismaUsers` WRITE;
/*!40000 ALTER TABLE `getPrismaUsers` DISABLE KEYS */;
/*!40000 ALTER TABLE `getPrismaUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `runTimeStats`
--

DROP TABLE IF EXISTS `runTimeStats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `runTimeStats` (
  `pk` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `apiurl` varchar(45) DEFAULT NULL,
  `entries` int DEFAULT NULL,
  `reason` varchar(45) DEFAULT NULL,
  `account_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `runTimeStats`
--

LOCK TABLES `runTimeStats` WRITE;
/*!40000 ALTER TABLE `runTimeStats` DISABLE KEYS */;
/*!40000 ALTER TABLE `runTimeStats` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-11-20 15:27:15
