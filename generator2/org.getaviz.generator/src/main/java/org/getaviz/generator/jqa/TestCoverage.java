package org.getaviz.generator.jqa;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.getaviz.generator.database.DatabaseConnector;
import org.getaviz.generator.SettingsConfiguration;
import org.getaviz.generator.Step;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.jar.JarEntry;
import java.util.jar.JarInputStream;
import java.util.HashMap;

import java.util.Arrays; //FIXME: delete after debugging

public class TestCoverage implements Step {

	private SettingsConfiguration config;
	private Log log = LogFactory.getLog(this.getClass());
	private DatabaseConnector connector = DatabaseConnector.getInstance();
	private File testReportFile;
	private String testReportName = "jacoco.csv";
	private String reportOutputPath = "/var/lib/jetty/tmpReport.csv";
	
	public TestCoverage(SettingsConfiguration config) {
		this.config = config;
	}
	
	public void run() {
		log.info("Extract test coverage from jar file.");
		if(checkRequirements()) {
			log.info("Test coverage report found and database writing started.");
			readTestReport();
			// Delete testReportFile
			log.info("Database enrichment completed.");
		} else {
			log.info("Test report file not found.");
		}
	}
	
	@Override
	public boolean checkRequirements() {
		// Check if test coverage is enabled in config
		// Check if test coverage data exists, i.e. does the jar file contain a test report?
		
		return extractTestReport();//(config.extractTestCoverage() && extractTestReport());
	}
	
	private boolean extractTestReport() {
		log.info("extractTestReport()");
		String [] files = config.getInputFiles().split(",");
		log.info("input files: "+Arrays.toString(files));
		
		boolean fileExists = false;
		try {
			String trimmedPath = files[0].substring(files[0].lastIndexOf(System.getProperty("user.dir")));
			log.info(trimmedPath);
			File jarFile = new File(trimmedPath);
			FileInputStream fis = new FileInputStream(jarFile);
			JarInputStream jis = new JarInputStream(fis);
			JarEntry je;
			while((je=jis.getNextJarEntry())!=null) {
				String fileName = je.getName();
				if(fileName.endsWith(testReportName)) {
					fileExists = true;
					testReportFile = new File(reportOutputPath);
					FileOutputStream fos = new FileOutputStream(testReportFile);
					for (int c = jis.read(); c!= -1; c = jis.read()) {
						fos.write(c);
					}
					fos.close();
				}
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
		return fileExists;
	}
	
	private void readTestReport() {
		HashMap<String, Integer[]> packages = new HashMap<>();
		log.info("readTestReport");
		try {
			FileReader fr = new FileReader(testReportFile);
			BufferedReader br = new BufferedReader(fr);
			String line = br.readLine();
			log.info("Report schema is: "+line);
			while(( line = br.readLine() ) != null) {
				String[] values = line.split(",");
				
				Integer[] valueSums = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
				if(packages.containsKey(values[1])) {
					valueSums = packages.get(values[1]);
				}
				for(int i=0; i<10; i++) {
					valueSums[i] += Integer.parseInt(values[i+3]);
				}
				packages.put(values[1], valueSums);
				
				String className    = values[2];
				String fqn          = values[1] + "." + className;
				int    lines        = Integer.parseInt(values[7]) + Integer.parseInt(values[8]);
				double statementCov = Double.parseDouble(values[4])  / (Double.parseDouble(values[3])  + Double.parseDouble(values[4]));
				double branchCov    = Double.parseDouble(values[6])  / (Double.parseDouble(values[5])  + Double.parseDouble(values[6]));
				double lineCov      = Double.parseDouble(values[8])  / lines;
				double cxtyCov      = Double.parseDouble(values[10]) / (Double.parseDouble(values[9])  + Double.parseDouble(values[10]));
				double methodCov    = Double.parseDouble(values[12]) / (Double.parseDouble(values[11]) + Double.parseDouble(values[12]));
				
				String s = String.format("MATCH (n {fqn: '%s'}) CREATE (n)-[:HAS_COVERAGE]->(Coverage:Coverage {name: '%sCoverage'})", fqn, className);
				connector.executeWrite(s);
				
				s = String.format("MATCH (Coverage:Coverage {name: '%sCoverage'})", className);
				s +=                            s += " SET Coverage.lines="             + lines;
				if(!Double.isNaN(statementCov)) s += " SET Coverage.statementCoverage=" + statementCov;
				if(!Double.isNaN(branchCov))    s += " SET Coverage.branchCoverage="    + branchCov;
				if(!Double.isNaN(lineCov))      s += " SET Coverage.lineCoverage="      + lineCov;
				if(!Double.isNaN(cxtyCov))      s += " SET Coverage.complexityCoverage="+ cxtyCov;
				if(!Double.isNaN(methodCov))    s += " SET Coverage.methodCoverage="    + methodCov;
				if(s.contains("SET")) connector.executeWrite(s);
			}
		} catch (IOException e) {
			log.info("Exception catched.");
			log.info(e.toString());
			e.printStackTrace();
		}
		addPackageCoverage(packages);
	}
	
	private void addPackageCoverage(HashMap<String, Integer[]> packages) {
		for(Object key: packages.keySet().toArray()) {
			Integer[] values = packages.get(key);
			String fqn = (String)key;
			String name = fqn.split("[.]")[fqn.split("[.]").length-1] + "Package";
			String s = String.format("MATCH (n {fqn: '%s'}) CREATE (n)-[:HAS_COVERAGE]->(Coverage:Coverage {name: '%sCoverage'})", fqn, name);
			connector.executeWrite(s);
			
			int lines           = values[4] + values[5];
			double statementCov = (double)values[1]  / (values[0]  + values[1]);
			double branchCov    = (double)values[3]  / (values[2]  + values[3]);
			double lineCov      = (double)values[5]  / lines;
			double cxtyCov      = (double)values[7] / (values[6]  + values[7]);
			double methodCov    = (double)values[9] / (values[8] + values[9]);
				
				s = String.format("MATCH (Coverage:Coverage {name: '%sCoverage'})", name);
				s +=                            s += " SET Coverage.lines="             + lines;
				if(!Double.isNaN(statementCov)) s += " SET Coverage.statementCoverage=" + statementCov;
				if(!Double.isNaN(branchCov))    s += " SET Coverage.branchCoverage="    + branchCov;
				if(!Double.isNaN(lineCov))      s += " SET Coverage.lineCoverage="      + lineCov;
				if(!Double.isNaN(cxtyCov))      s += " SET Coverage.complexityCoverage="+ cxtyCov;
				if(!Double.isNaN(methodCov))    s += " SET Coverage.methodCoverage="    + methodCov;
				if(s.contains("SET")) connector.executeWrite(s);
		}
	}
}
