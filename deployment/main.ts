import { Construct } from "constructs";
import { App, TerraformStack, AzurermBackend } from "cdktf";
import {
  linuxFunctionApp,
  resourceGroup,
  servicePlan,
  storageAccount,
} from "@cdktf/provider-azurerm";
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider";

const PROJECT_YYZ_INFRA = "project-yyz-infra";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AzurermProvider(this, "Azure", { features: {} });

    const rg = new resourceGroup.ResourceGroup(
      this,
      `rg-${PROJECT_YYZ_INFRA}`,
      {
        location: "Sweden Central",
        name: "pyyz-resource-group",
      }
    );

    const sa = new storageAccount.StorageAccount(
      this,
      `sa-${PROJECT_YYZ_INFRA}`,
      {
        name: "pyyz",
        resourceGroupName: rg.name,
        location: rg.location,
        accountTier: "Standard",
        accountReplicationType: "LRS",
      }
    );

    const sp = new servicePlan.ServicePlan(this, `sp-${PROJECT_YYZ_INFRA}`, {
      name: "pyyz-backend-sp",
      location: rg.location,
      osType: "Linux",
      resourceGroupName: rg.name,
      skuName: "Y1",
    });

    new linuxFunctionApp.LinuxFunctionApp(
      this,
      `function-${PROJECT_YYZ_INFRA}`,
      {
        name: "pyyz-backend",
        location: rg.location,
        resourceGroupName: rg.name,
        storageAccountName: sa.name,
        storageAccountAccessKey: sa.primaryAccessKey,
        servicePlanId: sp.id,
        siteConfig: {},
      }
    );
  }
}

const app = new App();
const stack = new MyStack(app, PROJECT_YYZ_INFRA);
new AzurermBackend(stack, {
  resourceGroupName: "tfstate",
  storageAccountName: "tfstate30637",
  containerName: "tfstate",
  key: "terraform.tfstate",
});
app.synth();
