# db-policy.hcl
path "secret/db/" {
  capabilities = ["read", "list"]
}

path "secret/settings/" {
  capabilities = ["read"]
}

path "secret/oauth/" {
  capabilities = ["read"]
}