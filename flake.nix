{
  description = "tenant-security-client-nodejs";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        lib = import <nixpkgs/lib>;
        pkgs = nixpkgs.legacyPackages.${system};
      in rec {
        packages = {
          tenant-security-client-nodejs = {
            name = "tenant-security-client-nodejs";
            version = "0.1.0";
            src = ./.;
            buildInputs = with pkgs.nodePackages; [
              pkgs.nodejs-18_x
              pkgs.protobuf
              (pkgs.yarn.override { nodejs = nodejs-18_x; })
            ];
            nativeBuildInputs = [ ]
              ++ lib.optionals (pkgs.stdenv.isDarwin) [ pkgs.darwin.cctools ];
          };
        };
        defaultPackage = packages.tenant-security-client-nodejs;

        devShell = pkgs.mkShell {
          buildInputs = with pkgs.nodePackages; [
            pkgs.nodejs-18_x
            pkgs.protobuf
            (pkgs.yarn.override { nodejs = pkgs.nodejs-18_x; })
          ];
        };
      });
}
