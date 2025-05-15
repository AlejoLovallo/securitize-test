import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from "@nestjs/terminus";
import { existsSync, readFileSync } from "fs";

@Controller("")
export class HealthController {
  private readonly buildTime: string;
  private readonly commitHash: string;
  private readonly env: string;

  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private readonly configService: ConfigService
  ) {
    const buildInfoPath = "build.info";

    if (existsSync(buildInfoPath)) {
      const buildInfo = readFileSync(buildInfoPath, "utf8").split("\n");
      const buildTime = buildInfo[0];
      this.buildTime = buildTime
        ? new Date(buildTime).toISOString()
        : new Date().toISOString();
      this.commitHash = buildInfo[1] || "";
    } else {
      this.buildTime = new Date().toISOString();
      this.commitHash = "";
    }
    this.env = process.env["ORG_ENV"] || "testnet";
  }

  @Get("/health")
  @HealthCheck()
  check() {
    const appName = this.configService.get<string>("APP_NAME");
    const environment = this.configService.get<string>("NODE_ENV");

    return this.health.check([
      () =>
        this.http.pingCheck(
          `${appName} - ${environment}`,
          "https://docs.nestjs.com"
        ),
    ]);
  }

  @Get("/version")
  getVersion() {
    return {
      buildTime: this.buildTime,
      commitHash: this.commitHash,
      env: this.env,
    };
  }
}
