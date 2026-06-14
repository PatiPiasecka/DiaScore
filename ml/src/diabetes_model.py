import torch.nn as nn


class DiabetesModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(8, 32)
        self.fc2 = nn.Linear(32, 16)
        self.fc3 = nn.Linear(16, 1)

        self.dropout = nn.Dropout(0.3)
        self.activation_function = nn.ReLU()

    def forward(self, x):
        x = self.fc1(x)
        x = self.activation_function(x)
        x = self.dropout(x)

        x = self.fc2(x)
        x = self.activation_function(x)
        x = self.dropout(x)

        x = self.fc3(x)
        return x
