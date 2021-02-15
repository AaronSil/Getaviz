package org.getaviz.generator.extract;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.getaviz.generator.SettingsConfiguration;
import org.getaviz.generator.Step;
import org.getaviz.generator.database.DatabaseConnector;

public class DatabaseCleaner implements Step {
	private SettingsConfiguration config;
	private Log log = LogFactory.getLog(this.getClass());
	private DatabaseConnector connector = DatabaseConnector.getInstance();
	
	String[] fileNameIncludes = {
		"target"
	};
	String[] fileNameExcludes = {
		"/java/",
		"/org/",
		".jar"
	};
	
	public DatabaseCleaner(SettingsConfiguration config) {
		this.config = config;
	}
	
	public void run() {
		if(checkRequirements()) {
			deleteNodesByPattern();
		}
	}
	
	@Override
	public boolean checkRequirements() {
		return true;
	}
	
	public void deleteNodesByPattern() {
		if(0 < fileNameIncludes.length) {
			String includeString = "";
			for(int i=0; i<fileNameIncludes.length; i++) {
				if(i!=0) includeString += " OR ";
				includeString += "n.fileName CONTAINS('"+fileNameIncludes[i]+"')";
			}
			String excludeString = "";
			for(int i=0; i<fileNameExcludes.length; i++) {
				excludeString += " AND NOT n.fileName CONTAINS('"+fileNameExcludes[i]+"')";
			}
			String queryString = String.format("MATCH (n) WHERE %s %s DETACH DELETE n", includeString, excludeString);
			log.info("Perform delete query: " + queryString);
			connector.executeWrite(queryString);
		}
	}
}
