storage "file" {
  path = "/vault/file"
}

api_addr = "http://0.0.0.0:8200"

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

disable_clustering = true
disable_mlock = true