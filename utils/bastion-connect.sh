#!/bin/bash

az network bastion ssh --name "bas-ops-hub-01" --resource-group "rg-ops-hub-01" --subscription "b7930752-ff43-405e-8998-ed69bda7ddc5" --target-resource-id="/subscriptions/b7930752-ff43-405e-8998-ed69bda7ddc5/resourceGroups/rg-ops-hub-01/providers/Microsoft.Compute/virtualMachines/vm-ops-hub-jbox-01" --auth-type "password" --username "dbcopsadmin"