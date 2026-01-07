-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: bdproyectopre
-- ------------------------------------------------------
-- Server version	9.4.0

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
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `dni_ce` varchar(20) NOT NULL,
  `genero` enum('M','F') NOT NULL,
  `codigo_carnet` varchar(50) NOT NULL,
  `celular` varchar(10) DEFAULT NULL,
  `apoderado` varchar(45) NOT NULL,
  `cel_apoderado` varchar(45) NOT NULL,
  `bloqueo_manual` tinyint(1) DEFAULT '0',
  `usuario_id` int DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_carnet` (`codigo_carnet`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumnos`
--

LOCK TABLES `alumnos` WRITE;
/*!40000 ALTER TABLE `alumnos` DISABLE KEYS */;
INSERT INTO `alumnos` VALUES (1,'Juan Carlos','Pérez Gómez','12345678','M','QR-12345678',NULL,'Juana Galvez','944165',0,NULL,1),(2,'Jhon Walter Pepe','Peralta Galvan','87654321','M','QR-87654321',NULL,'Rosa Marin','546465',0,NULL,1),(3,'Benny Max','Carbajal Rios','123454565','M','QR-123454565',NULL,'Jeson Savedra','566545',0,NULL,1),(4,'JUAN','galvez','54946','M','QR-54946','123456','carlos espinoza','945878',0,NULL,1),(5,'jhonatan ','carbajal','75260097','M','QR-75260097','912947169','luis enrique','954435927',0,NULL,1),(6,'sara rosa','ferreyra acho','98765432','F','QR-98765432','51654564','mamani','1215299',0,NULL,1),(7,'juan carlos','peres gomez','45687213','M','QR-45687213','912947169','luis gomez','912947169',0,NULL,1),(8,'alfredo ','rios','06665464','M','QR-06665464','972729921','juan rios','972729921',0,NULL,1),(9,'ANGEL','CANALES SUAREZ','09849606','M','QR-09849606','951212752','MANUEL GONZALES','999444888',0,NULL,1);
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones_cursos`
--

DROP TABLE IF EXISTS `asignaciones_cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones_cursos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nivel_curso_id` int NOT NULL,
  `seccion_id` int NOT NULL,
  `docente_id` int NOT NULL,
  `periodo_id` int NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `nivel_curso_id` (`nivel_curso_id`),
  KEY `seccion_id` (`seccion_id`),
  KEY `docente_id` (`docente_id`),
  KEY `periodo_id` (`periodo_id`),
  CONSTRAINT `asignaciones_cursos_ibfk_1` FOREIGN KEY (`nivel_curso_id`) REFERENCES `nivel_cursos` (`id`),
  CONSTRAINT `asignaciones_cursos_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`),
  CONSTRAINT `asignaciones_cursos_ibfk_3` FOREIGN KEY (`docente_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `asignaciones_cursos_ibfk_4` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_cursos`
--

LOCK TABLES `asignaciones_cursos` WRITE;
/*!40000 ALTER TABLE `asignaciones_cursos` DISABLE KEYS */;
/*!40000 ALTER TABLE `asignaciones_cursos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asistencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `fecha` date NOT NULL,
  `hora_entrada` time NOT NULL,
  `situacion` enum('PUNTUAL','TARDE','FALTA','JUSTIFICADO') NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `alumno_id` (`alumno_id`),
  CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
INSERT INTO `asistencias` VALUES (1,5,'2026-01-03','04:24:33','PUNTUAL',1),(2,6,'2026-01-03','04:42:13','PUNTUAL',1),(3,4,'2026-01-03','04:42:57','PUNTUAL',1),(4,2,'2026-01-03','04:44:47','PUNTUAL',1),(5,7,'2026-01-03','11:18:52','TARDE',1),(6,8,'2026-01-03','11:20:29','TARDE',1),(7,9,'2026-01-03','11:28:07','TARDE',1);
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cursos`
--

DROP TABLE IF EXISTS `cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cursos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cursos`
--

LOCK TABLES `cursos` WRITE;
/*!40000 ALTER TABLE `cursos` DISABLE KEYS */;
INSERT INTO `cursos` VALUES (1,'Matemática',1),(2,'Comunicación',0);
/*!40000 ALTER TABLE `cursos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matriculas`
--

DROP TABLE IF EXISTS `matriculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matriculas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `seccion_id` int NOT NULL,
  `periodo_id` int NOT NULL,
  `fecha_matricula` datetime DEFAULT CURRENT_TIMESTAMP,
  `situacion` varchar(45) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `alumno_id` (`alumno_id`),
  KEY `seccion_id` (`seccion_id`),
  KEY `periodo_id` (`periodo_id`),
  CONSTRAINT `matriculas_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  CONSTRAINT `matriculas_ibfk_2` FOREIGN KEY (`seccion_id`) REFERENCES `secciones` (`id`),
  CONSTRAINT `matriculas_ibfk_3` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matriculas`
--

LOCK TABLES `matriculas` WRITE;
/*!40000 ALTER TABLE `matriculas` DISABLE KEYS */;
INSERT INTO `matriculas` VALUES (1,5,6,1,'2025-12-23 10:56:58','Ingresante',1),(2,2,4,1,'2025-12-23 13:09:26','Ingresante',1),(3,4,5,2,'2026-01-03 02:33:45','Ingresante',1),(4,6,6,1,'2026-01-03 02:34:02','Ingresante',1),(5,6,6,2,'2026-01-03 02:34:17','Ingresante',1),(6,9,6,1,'2026-01-03 11:26:35','Ingresante',1);
/*!40000 ALTER TABLE `matriculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nivel_cursos`
--

DROP TABLE IF EXISTS `nivel_cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nivel_cursos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nivel_id` int NOT NULL,
  `curso_id` int NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_nivel_curso` (`nivel_id`,`curso_id`),
  KEY `curso_id` (`curso_id`),
  CONSTRAINT `nivel_cursos_ibfk_1` FOREIGN KEY (`nivel_id`) REFERENCES `niveles` (`id`),
  CONSTRAINT `nivel_cursos_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nivel_cursos`
--

LOCK TABLES `nivel_cursos` WRITE;
/*!40000 ALTER TABLE `nivel_cursos` DISABLE KEYS */;
/*!40000 ALTER TABLE `nivel_cursos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `niveles`
--

DROP TABLE IF EXISTS `niveles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `niveles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `niveles`
--

LOCK TABLES `niveles` WRITE;
/*!40000 ALTER TABLE `niveles` DISABLE KEYS */;
INSERT INTO `niveles` VALUES (1,'nivel 1',1),(2,'nivel 2',1),(3,'nivel 3',1),(4,'nivel 4',1),(5,'nivel 5',1),(6,'PRE',1);
/*!40000 ALTER TABLE `niveles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notas`
--

DROP TABLE IF EXISTS `notas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `asignacion_curso_id` int NOT NULL,
  `tipo_evaluacion_id` int NOT NULL,
  `valor` decimal(5,2) NOT NULL,
  `fecha` date NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `alumno_id` (`alumno_id`),
  KEY `asignacion_curso_id` (`asignacion_curso_id`),
  KEY `tipo_evaluacion_id` (`tipo_evaluacion_id`),
  CONSTRAINT `notas_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  CONSTRAINT `notas_ibfk_2` FOREIGN KEY (`asignacion_curso_id`) REFERENCES `asignaciones_cursos` (`id`),
  CONSTRAINT `notas_ibfk_3` FOREIGN KEY (`tipo_evaluacion_id`) REFERENCES `tipos_evaluacion` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notas`
--

LOCK TABLES `notas` WRITE;
/*!40000 ALTER TABLE `notas` DISABLE KEYS */;
/*!40000 ALTER TABLE `notas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodos_academicos`
--

DROP TABLE IF EXISTS `periodos_academicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodos_academicos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `anio` int NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `situacion` varchar(45) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos_academicos`
--

LOCK TABLES `periodos_academicos` WRITE;
/*!40000 ALTER TABLE `periodos_academicos` DISABLE KEYS */;
INSERT INTO `periodos_academicos` VALUES (1,'Vacacional',2026,'2026-01-06','2026-02-20','ACTIVO',1),(2,'1 Bimestre',2026,'2026-03-05','2026-12-15',NULL,1);
/*!40000 ALTER TABLE `periodos_academicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `fecha` date NOT NULL,
  `motivo` text NOT NULL,
  `evidencia` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `alumno_id` (`alumno_id`),
  CONSTRAINT `permisos_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN',1),(2,'DOCENTE',1),(3,'AUXILIAR',1),(4,'ALUMNO',1);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `secciones`
--

DROP TABLE IF EXISTS `secciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `secciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `nivel_id` int DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `secciones_ibfk_1` (`nivel_id`),
  CONSTRAINT `secciones_ibfk_1` FOREIGN KEY (`nivel_id`) REFERENCES `niveles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `secciones`
--

LOCK TABLES `secciones` WRITE;
/*!40000 ALTER TABLE `secciones` DISABLE KEYS */;
INSERT INTO `secciones` VALUES (1,'aula 1',NULL,1),(2,'aula 2',NULL,1),(3,'aula 3',NULL,1),(4,'aula 4',NULL,1),(5,'aula 5',NULL,1),(6,'PRE',NULL,1);
/*!40000 ALTER TABLE `secciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_evaluacion`
--

DROP TABLE IF EXISTS `tipos_evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_evaluacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_evaluacion`
--

LOCK TABLES `tipos_evaluacion` WRITE;
/*!40000 ALTER TABLE `tipos_evaluacion` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipos_evaluacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_roles`
--

DROP TABLE IF EXISTS `usuario_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `rol_id` int NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuario_roles_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuario_roles_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_roles`
--

LOCK TABLES `usuario_roles` WRITE;
/*!40000 ALTER TABLE `usuario_roles` DISABLE KEYS */;
INSERT INTO `usuario_roles` VALUES (1,1,1,1),(2,2,1,1),(3,3,1,1);
/*!40000 ALTER TABLE `usuario_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(100) NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `estado` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Jhonatan Carbajal','jota','$2b$10$Uxa9HJq7Ph2r/4TIy/bp0eXH7x0U.d4aClJuFzKpnexGhXbyuGuJu',1),(2,'Juan Pérez','jperez','$2b$10$lcXrXMvstI7fOqEhNLJEv.TUnF8iBeVW3U3EoEzTwazJ1Ds14UuRa',0),(3,'Jhonatan Gonzales','root','$2b$10$85uRTnTgTQuiLrldgKEPzevZypmQhwx.AE/FMlh0aiDBTLOnXSyN2',1);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-07 13:50:00
