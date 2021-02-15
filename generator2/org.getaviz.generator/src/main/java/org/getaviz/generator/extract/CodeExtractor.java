 package org.getaviz.generator.extract;
 
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.getaviz.generator.SettingsConfiguration;
import org.getaviz.generator.Step;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.jar.JarEntry;
import java.util.jar.JarInputStream;
 
 public class CodeExtractor implements Step {
 	private SettingsConfiguration config;
	private Log log = LogFactory.getLog(this.getClass());
	private enum CoverageTools {
		jacoco
	}
	private CoverageTools coverageTool = CoverageTools.jacoco;
	private String outputDirectory;
	
	public CodeExtractor(SettingsConfiguration config) {
		this.config = config;
		outputDirectory = config.getOutputPath() + "../sourceCode";
	}
	
	public void run() {
		if(checkRequirements()) {
			log.info("Code extraction started");
			switch(coverageTool.name()) {
				case "jacoco":
					extractJacocoReport();
					stripHTML();
					break;
				default:
					extractJacocoReport();
					break;
			}
		} else {
			log.info("Unexpected jar file structure");
		}
		log.info("Code extraction finished");
	}
	
	@Override
	public boolean checkRequirements() {
		return true;
	}
	
	private void extractJacocoReport() {
		String pathToClasses = "target/site/jacoco/";
		String[] inputFiles = config.getInputFiles().split(",");
		try {
			File jarFile = new File(inputFiles[0].substring(inputFiles[0].lastIndexOf(System.getProperty("user.dir"))));
			FileInputStream fis = new FileInputStream(jarFile);
			JarInputStream jis = new JarInputStream(fis);
			System.out.println(jis.markSupported());
			JarEntry je;
			File newDirectory = new File(outputDirectory);
			newDirectory.mkdir();
			while((je=jis.getNextJarEntry())!=null) {
				String fileName = je.getName();
				if(fileName.contains(pathToClasses)) {
					if(fileName.endsWith("/")) {
						String [] fileNameSplit = fileName.split("site/");
						File directory = new File(outputDirectory+"/"+fileNameSplit[1]);
						directory.mkdir();
					} else {
						String [] fileNameSplit = fileName.split("site/");
						File outputFile = new File(outputDirectory+"/"+fileNameSplit[1]);
						FileOutputStream fos = new FileOutputStream(outputFile);
						System.out.println("Writing file " + fileName);
						for (int c = jis.read(); c!= -1; c = jis.read()) {
							fos.write(c);
						}
						fos.close();
					}
				}
			}
			jis.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private void stripHTML() {
		
	}
 }
