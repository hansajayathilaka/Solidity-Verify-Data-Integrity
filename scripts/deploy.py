from brownie import Certificate, config, network  # type: ignore

from .utils import owner


def deploy():
    certificateStorage = Certificate.deploy(
        owner,
        publish_source=config["networks"][network.show_active()].get("verify"),
    )
    print(f'Contract deployed to {certificateStorage.address}')
    return certificateStorage.address


def create_build_for_client(address):
    import os, json

    script_dir = os.path.dirname(__file__)
    rel_path = f"../build/deployments/{config['networks'][network.show_active()].get('chain_id')}/{address}.json"
    abs_file_path = os.path.normpath(os.path.join(script_dir, rel_path))
    with open(abs_file_path, "r") as f:
        build = json.load(f)
    abi = build["abi"]

    rel_path = f"../contract.json"
    abs_file_path = os.path.normpath(os.path.join(script_dir, rel_path))
    with open(abs_file_path, 'w+', encoding='utf-8') as f:
        data = {
            "address": address,
            "abi": abi,
        }
        json.dump(data, f, indent=4)


def main():
    address = deploy()
    create_build_for_client(address)
