-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jun 19, 2015 at 01:16 AM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `mce_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `mce_answer`
--

CREATE TABLE IF NOT EXISTS `mce_answer` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ReviewID` int(11) DEFAULT NULL,
  `QuestionID` int(11) DEFAULT NULL,
  `Value` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=500001 ;

-- --------------------------------------------------------

--
-- Table structure for table `mce_class`
--

CREATE TABLE IF NOT EXISTS `mce_class` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ClassTypeID` int(11) DEFAULT NULL,
  `FacultyID` int(11) DEFAULT NULL,
  `StudentList` varchar(1024) DEFAULT NULL,
  `Semester` varchar(80) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=200001 ;

-- --------------------------------------------------------

--
-- Table structure for table `mce_faculty`
--

CREATE TABLE IF NOT EXISTS `mce_faculty` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(80) DEFAULT NULL,
  `LastName` int(11) DEFAULT NULL,
  `Active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=100001 ;

-- --------------------------------------------------------

--
-- Table structure for table `mce_review`
--

CREATE TABLE IF NOT EXISTS `mce_review` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `StudentID` int(11) DEFAULT NULL,
  `ClassID` int(11) DEFAULT NULL,
  `FacultyID` int(11) DEFAULT NULL,
  `DateReviewed` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=400001 ;

-- --------------------------------------------------------

--
-- Table structure for table `mce_student`
--

CREATE TABLE IF NOT EXISTS `mce_student` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `FIrstName` varchar(80) DEFAULT NULL,
  `LastName` varchar(80) DEFAULT NULL,
  `Cohort` varchar(80) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=300001 ;

-- --------------------------------------------------------

--
-- Table structure for table `mce_tl_classlist`
--

CREATE TABLE IF NOT EXISTS `mce_tl_classlist` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Short Name` varchar(20) DEFAULT NULL,
  `Long Name` varchar(120) DEFAULT NULL,
  `Block` varchar(40) DEFAULT NULL,
  `Active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=600001 ;

-- --------------------------------------------------------

--
-- Table structure for table `mce_tl_questionlist`
--

CREATE TABLE IF NOT EXISTS `mce_tl_questionlist` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Question` varchar(200) DEFAULT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=700001 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
