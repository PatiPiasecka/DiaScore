from torch.utils.data import DataLoader

from .dataset import DiabetesDataset


def get_diabetes_dataloaders(
    train_path: str, val_path: str, batch_size: int = 32, num_workers: int = 0
) -> tuple[DataLoader, DataLoader]:
    """
    Creates PyTorch DataLoaders for the diabetes dataset.

    Args:
        train_path (str): Path to the training CSV.
        val_path (str): Path to the validation CSV.
        batch_size (int): Batch size for the DataLoaders.
        num_workers (int): Number of worker processes for data loading - we have a small dataset so 0 is fine.

    Returns:
        tuple: (train_dataloader, val_dataloader)
    """
    train_dataset = DiabetesDataset(data_path=train_path)
    val_dataset = DiabetesDataset(data_path=val_path)

    train_dataloader = DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers
    )

    val_dataloader = DataLoader(
        val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers
    )

    return train_dataloader, val_dataloader
