import torch
from torch import nn, optim
from pathlib import Path

from dataloader import get_diabetes_dataloaders
from diabetes_model import DiabetesModel

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DATA_PATH = PROJECT_ROOT / "data"
WEIGHTS_PATH = PROJECT_ROOT / "ml" / "weights"
TRAIN_PATH = DATA_PATH / "train.csv"
VAL_PATH = DATA_PATH / "val.csv"


def train(num_epochs: int = 100) -> None:
    train_loader, val_loader = get_diabetes_dataloaders(TRAIN_PATH, VAL_PATH)

    model = DiabetesModel()

    weight = torch.tensor([1.86])
    criterion = nn.BCEWithLogitsLoss(pos_weight=weight)
    optimizer = optim.Adam(model.parameters(), lr=0.0005, weight_decay=1e-4)

    best_val_loss = float("inf")

    for epoch in range(num_epochs):
        # Training phase
        model.train()
        running_loss = 0.0

        for inputs, labels in train_loader:
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        avg_train_loss = running_loss / len(train_loader)

        # Validation phase
        model.eval()
        val_running_loss = 0.0
        correct = 0
        total = 0

        with torch.no_grad():
            for inputs, labels in val_loader:
                outputs = model(inputs)

                loss = criterion(outputs, labels)
                val_running_loss += loss.item()

                predicted = (outputs > 0.0).float()
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

        val_loss = val_running_loss / len(val_loader)
        accuracy = 100 * correct / total

        print(
            f"Epoch {epoch + 1:03d}/{num_epochs} | Train Loss: {avg_train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Acc: {accuracy:.1f}%"
        )

        # Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            WEIGHTS_PATH.mkdir(parents=True, exist_ok=True)
            torch.save(model.state_dict(), WEIGHTS_PATH / "best_model.pt")


if __name__ == "__main__":
    train()
