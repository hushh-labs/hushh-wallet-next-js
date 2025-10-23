import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const projectRoot = process.cwd();
    
    console.log('Project root:', projectRoot);
    
    // Check if certificate files exist
    const certFiles = ['signerCert.pem', 'signerKey.pem', 'wwdr.pem'];
    const fileStatus: Record<string, any> = {};
    
    for (const file of certFiles) {
      const filePath = path.join(projectRoot, file);
      try {
        const stats = fs.statSync(filePath);
        fileStatus[file] = {
          exists: true,
          size: stats.size,
          path: filePath
        };
      } catch (error) {
        fileStatus[file] = {
          exists: false,
          error: error instanceof Error ? error.message : String(error),
          path: filePath
        };
      }
    }
    
    // Check pass model directory
    const passModelPath = path.join(projectRoot, 'passModels', 'luxury.pass');
    let passModelStatus: Record<string, any> = {};
    
    try {
      const passModelFiles = fs.readdirSync(passModelPath);
      passModelStatus = {
        exists: true,
        files: passModelFiles,
        path: passModelPath
      };
    } catch (error) {
      passModelStatus = {
        exists: false,
        error: error instanceof Error ? error.message : String(error),
        path: passModelPath
      };
    }
    
    // List all files in project root
    let rootFiles = [];
    try {
      rootFiles = fs.readdirSync(projectRoot);
    } catch (error) {
      rootFiles = [`Error: ${error}`];
    }
    
    return NextResponse.json({
      projectRoot,
      certificates: fileStatus,
      passModel: passModelStatus,
      rootFiles: rootFiles.slice(0, 50), // Limit to first 50 files
      environment: process.env.NODE_ENV || 'unknown',
      vercel: process.env.VERCEL || 'false'
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
